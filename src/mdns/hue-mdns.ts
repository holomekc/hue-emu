import { createSocket, Socket } from "dgram";
import { HueBuilder } from "../builder/hue-builder";
import { AddressInfo } from "net";
import Timeout = NodeJS.Timeout;
import * as dnsPacket from "dns-packet";
import { HueMdnsRecords } from "./hue-mdns-records";
import { Observable } from "rxjs";

export class HueMdns {
  private static readonly MDNS_PORT = 5353;
  private static readonly MULTI_ADDR = "224.0.0.251";

  private readonly server: Socket;
  private readonly mdnsPort: number;
  private readonly mdnsName: string;
  private readonly mdnsSrvName: string;

  private readonly bridgeId: string;
  private readonly modelId: string;
  private readonly shortBridgeId: string;
  private readonly notifier: Timeout;

  constructor(private builder: HueBuilder) {
    this.mdnsPort = HueMdns.MDNS_PORT;
    this.server = createSocket({
      type: "udp4",
      // reuse is necessary. 5353 is most likely used by other services already.
      reuseAddr: true,
    });

    this.server.on("error", this.onError);
    this.server.on("message", this.onMessage);
    this.server.on("listening", this.onListening);

    // prepare bridge and mdns values.
    this.bridgeId = builder.bridgeId.toLowerCase();
    this.modelId = builder.modelId;

    this.shortBridgeId = this.bridgeId.substring(this.bridgeId.length - 6, this.bridgeId.length);
    // mdnsName:
    //  spec: Philips Hue - XXXXXX
    //  actual hue bridge: Hue Bridge - XXXXXX
    //  XXXXXX = last 6 digits of bridgeId.
    this.mdnsName = `Hue Bridge - ${this.shortBridgeId}.${HueMdnsRecords.MDNS_TYPE}`;
    this.mdnsSrvName = `${this.bridgeId}.local`;

    // bind server
    this.server.bind(
      {
        port: this.mdnsPort,
        address: this.builder.host,
      },
      () => {
        this.server.addMembership(HueMdns.MULTI_ADDR, this.builder.host);
      }
    );

    // https://datatracker.ietf.org/doc/html/rfc6763#section-12.1
    const broadCastPacket = this.encode(
      [HueMdnsRecords.createHuePtrRecord(this.mdnsName)],
      [
        HueMdnsRecords.createHueSrvRecord(this.mdnsName, this.mdnsSrvName, this.builder.discoveryPort),
        HueMdnsRecords.createHueTxtRecord(this.mdnsName, this.bridgeId, this.modelId),
        HueMdnsRecords.createHueARecord(this.mdnsSrvName, this.builder.discoveryHost),
      ]
    );

    this.notifier = setInterval(() => {
      this.server.send(broadCastPacket, 0, broadCastPacket.length, this.mdnsPort, HueMdns.MULTI_ADDR);
    }, 20000);
    this.server.send(broadCastPacket, 0, broadCastPacket.length, this.mdnsPort, HueMdns.MULTI_ADDR);
  }

  public stop(): Observable<void> {
    return new Observable<void>((subscriber) => {
      clearInterval(this.notifier);
      this.server.close(() => {
        this.builder.logger.info("HueMdns: Server stopped");
        subscriber.next();
        subscriber.complete();
      });
    });
  }

  private onError = (err: Error) => {
    this.builder.logger.error(`HueMdns: Server error. Shutdown server:\n${err.stack}`);
    this.server.close();
  };

  private onMessage = (msg: Buffer, rinfo: AddressInfo) => {
    if (msg !== null && typeof msg !== "undefined") {
      let message = dnsPacket.decode(msg);

      let response: Buffer | undefined = undefined;

      if (message.type === "query") {
        message.questions?.forEach((question) => {
          if (question.type === "PTR" && question.name === HueMdnsRecords.MDNS_SERVICE_LOOKUP) {
            this.builder.logger.debug(
              `HueMdns: Received PTR ${HueMdnsRecords.MDNS_SERVICE_LOOKUP} from ${rinfo.address}:${rinfo.port}`
            );
            response = this.encode([HueMdnsRecords.createServiceLookupAnswer()]);
          } else if (question.type === "PTR" && question.name.includes(HueMdnsRecords.MDNS_TYPE)) {
            this.builder.logger.debug(
              `HueMdns: Received PTR ${HueMdnsRecords.MDNS_TYPE} from ${rinfo.address}:${rinfo.port}`
            );
            // https://datatracker.ietf.org/doc/html/rfc6763#section-12.1
            response = this.encode(
              [HueMdnsRecords.createHuePtrRecord(this.mdnsName)],
              [
                HueMdnsRecords.createHueSrvRecord(this.mdnsName, this.mdnsSrvName, this.builder.discoveryPort),
                HueMdnsRecords.createHueTxtRecord(this.mdnsName, this.bridgeId, this.modelId),
                HueMdnsRecords.createHueARecord(this.mdnsSrvName, this.builder.discoveryHost),
              ]
            );
          } else if (question.type === "SRV" && question.name === this.mdnsName) {
            this.builder.logger.debug(
              `HueMdns: Received SRV ${this.mdnsName} from ${rinfo.address}:${rinfo.port}`
            );
            // https://datatracker.ietf.org/doc/html/rfc6763#section-12.2
            response = this.encode([
              HueMdnsRecords.createHueSrvRecord(this.mdnsName, this.mdnsSrvName, this.builder.discoveryPort),
            ], [HueMdnsRecords.createHueARecord(this.mdnsSrvName, this.builder.discoveryHost)]);
          } else if (question.type === "A" && question.name === this.mdnsSrvName) {
            this.builder.logger.debug(
              `HueMdns: Received A ${this.mdnsName} from ${rinfo.address}:${rinfo.port}`
            );
            response = this.encode([HueMdnsRecords.createHueARecord(this.mdnsSrvName, this.builder.discoveryHost)]);
          } else if (question.type === "TXT" && question.name === this.mdnsName) {
            this.builder.logger.debug(
              `HueMdns: Received TXT ${this.mdnsName} from ${rinfo.address}:${rinfo.port}`
            );
            response = this.encode([HueMdnsRecords.createHueTxtRecord(this.mdnsName, this.bridgeId, this.modelId)]);
          }

          if (response) {
            this.server.send(response, 0, response.length, rinfo.port, rinfo.address, (err) => {
              if (err) {
                this.builder.logger.error(`HueMdns: Failed response:\n${err.stack}`);
              } else {
                this.builder.logger.debug(`HueMdns: Send Response to: ${rinfo.address}:${rinfo.port}`);
              }
            });
          }
        });
      }
    }
  };

  private onListening = () => {
    const address = this.server.address() as AddressInfo;
    this.builder.logger.debug(`HueMdns: Server listening ${address.address}:${address.port}`);

    this.server.setMulticastTTL(255);
    this.server.setMulticastLoopback(true);
  };

  private encode(answers: dnsPacket.Answer[], additionals?: dnsPacket.Answer[]) {
    return dnsPacket.encode({
      type: "response",
      id: 0,
      flags: dnsPacket.AUTHORITATIVE_ANSWER,
      answers: answers,
      additionals: additionals,
    });
  }
}
