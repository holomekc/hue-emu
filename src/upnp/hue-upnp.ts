import { createSocket, Socket } from "dgram";
import { AddressInfo } from "net";
import { Observable } from "rxjs";
import { HueBuilder } from "../builder/hue-builder";
import Timeout = NodeJS.Timeout;

/**
 * Responsible for handling upnp requests and answer them properly
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueUpnp {
  private static readonly UPNP_PORT = 1900;
  private static readonly MULTI_ADDR = "239.255.255.250";

  private readonly server: Socket;
  private readonly upnpPort: number;
  private readonly shortMac: string;
  private readonly bridgeId: string;
  private readonly notifier: Timeout;

  constructor(private builder: HueBuilder, port: number = HueUpnp.UPNP_PORT) {
    this.upnpPort = port;
    this.server = createSocket("udp4");

    this.server.on("error", this.onError);
    this.server.on("message", this.onMessage);
    this.server.on("listening", this.onListening);
    this.server.bind(this.getPort(), this.builder.host, () => {
      this.server.addMembership(HueUpnp.MULTI_ADDR, this.builder.host);
    });

    this.shortMac = builder.mac.replace(/:/g, "");
    this.bridgeId = builder.bridgeId;

    let message = `NOTIFY * HTTP/1.1\r\nHOST: ${HueUpnp.MULTI_ADDR}:${this.upnpPort}\r\nCACHE-CONTROL: max-age=100\r\nLOCATION: http://${this.builder.discoveryHost}:${this.builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nhue-bridgeid: ${this.bridgeId}\r\nNTS: ssdp:alive\r\nNT: upnp:rootdevice\r\nUSN: uuid:${this.builder.udn}::upnp:rootdevice\r\n\r\n`;
    const resMsg = Buffer.from(message);

    message = `NOTIFY * HTTP/1.1\r\nHOST: ${HueUpnp.MULTI_ADDR}:${this.upnpPort}\r\nCACHE-CONTROL: max-age=100\r\nLOCATION: http://${this.builder.discoveryHost}:${this.builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nhue-bridgeid: ${this.bridgeId}\r\nNTS: ssdp:alive\r\nNT: uuid:${this.builder.udn}\r\nUSN: uuid:${this.builder.udn}\r\n\r\n`;
    const resMsg2 = Buffer.from(message);

    message = `NOTIFY * HTTP/1.1\r\nHOST: ${HueUpnp.MULTI_ADDR}:${this.upnpPort}\r\nCACHE-CONTROL: max-age=100\r\nLOCATION: http://${this.builder.discoveryHost}:${this.builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nhue-bridgeid: ${this.bridgeId}\r\nNTS: ssdp:alive\r\nNT: urn:schemas-upnp-org:device:basic:1\r\nUSN: uuid:${this.builder.udn}::urn:schemas-upnp-org:device:basic:1\r\n\r\n`;
    const resMsg3 = Buffer.from(message);

    this.notifier = setInterval(() => {
      this.server.send(resMsg, 0, resMsg.length, this.upnpPort, HueUpnp.MULTI_ADDR);
      this.server.send(resMsg2, 0, resMsg2.length, this.upnpPort, HueUpnp.MULTI_ADDR);
      this.server.send(resMsg3, 0, resMsg3.length, this.upnpPort, HueUpnp.MULTI_ADDR);
    }, 20000);
  }

  public stop(): Observable<void> {
    return new Observable<void>((subscriber) => {
      clearInterval(this.notifier);
      this.server.close(() => {
        this.builder.logger.info("HueUpnp: Server stopped");
        subscriber.next();
        subscriber.complete();
      });
    });
  }

  private getPort(): number {
    return this.upnpPort;
  }

  private onError = (err: Error) => {
    this.builder.logger.error(`HueUpnp: Server error. Shutdown server:\n${err.stack}`);
    this.server.close();
  };

  private onMessage = (msg: Buffer, rinfo: AddressInfo) => {
    if (msg !== null && typeof msg !== "undefined") {
      const message = msg.toString();

      if (message.startsWith("M-SEARCH *")) {
        let ssdpAll = false;
        let root = false;
        let uuid = false;
        let basic = false;
        if (message.includes("ssdp:all")) {
          ssdpAll = true;
        }
        if (message.includes("upnp:rootdevice")) {
          root = true;
        }
        if (message.includes(`ST: uuid:${this.shortMac}`)) {
          uuid = true;
        }
        if (message.includes("urn:schemas-upnp-org:device:basic:1")) {
          basic = true;
        }

        if (ssdpAll || root || uuid || basic) {
          // only answer if relevant
          this.builder.logger.debug(
            `HueUpnp: Server got M-SEARCH request: ${msg} from ${rinfo.address}:${rinfo.port}\n`
          );

          const content = `HTTP/1.1 200 OK\r\nCACHE-CONTROL: max-age=100\r\nEXT:\r\nLOCATION: http://${this.builder.discoveryHost}:${this.builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nhue-bridgeid: ${this.bridgeId}\r\n`;

          if (ssdpAll || root) {
            this.builder.logger.debug("HueUpnp: answer with rootdevice");
            const response = content + `ST: upnp:rootdevice\r\nUSN: uuid:${this.builder.udn}::upnp:rootdevice\r\n\r\n`;
            this.sendMessage(response, rinfo);
          }
          if (ssdpAll || uuid) {
            this.builder.logger.debug("HueUpnp: answer with uuid");
            const response = content + `ST: uuid:${this.builder.udn}\r\nUSN: uuid:${this.builder.udn}\r\n\r\n`;
            this.sendMessage(response, rinfo);
          }
          if (ssdpAll || basic) {
            this.builder.logger.debug("HueUpnp: answer with basic");
            const response =
              content +
              `ST: urn:schemas-upnp-org:device:basic:1\r\nUSN: uuid:${this.builder.udn}::urn:schemas-upnp-org:device:basic:1\r\n\r\n`;
            this.sendMessage(response, rinfo);
          }
        }
      }
    }
  };

  private sendMessage(response: string, rinfo: AddressInfo) {
    const resMsg = Buffer.from(response);
    this.server.send(resMsg, 0, resMsg.length, rinfo.port, rinfo.address, (err) => {
      if (err) {
        this.builder.logger.error(`HueUpnp: Could not send M-SEARCH response.\n${err.stack}`);
      } else {
        this.builder.logger.debug(`HueUpnp: Send response to M-SEARCH request from ${rinfo.address}:${rinfo.port}`);
      }
    });
  }

  private onListening = () => {
    const address = this.server.address() as AddressInfo;
    this.builder.logger.debug(`HueUpnp: Server listening ${address.address}:${address.port}`);
  };
}
