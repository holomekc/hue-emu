import * as dnsPacket from "dns-packet";

export class HueMdnsRecords {
  public static readonly MDNS_SERVICE_LOOKUP = "_services._dns-sd._udp.local";
  public static readonly MDNS_TYPE = "_hue._tcp.local";

  public static createServiceLookupAnswer(): dnsPacket.StringAnswer {
    return {
      type: "PTR",
      class: "IN",
      flush: false,
      ttl: 4500,
      name: HueMdnsRecords.MDNS_SERVICE_LOOKUP,
      data: HueMdnsRecords.MDNS_TYPE,
    };
  }

  public static createHuePtrRecord(mdnsName: string): dnsPacket.StringAnswer {
    return {
      type: "PTR",
      class: "IN",
      flush: false,
      ttl: 4500,
      name: HueMdnsRecords.MDNS_TYPE,
      data: mdnsName,
    };
  }

  public static createHueSrvRecord(mdnsName: string, mdnsSrvName: string, port: number): dnsPacket.SrvAnswer {
    return {
      type: "SRV",
      class: "IN",
      flush: true,
      ttl: 120,
      name: mdnsName,
      data: {
        target: mdnsSrvName,
        port: port,
        priority: 0,
        weight: 0,
      },
    };
  }

  public static createHueARecord(mdnsSrvName: string, ip: string): dnsPacket.StringAnswer {
    return {
      type: "A",
      class: "IN",
      flush: true,
      ttl: 120,
      name: mdnsSrvName,
      data: ip,
    };
  }

  public static createHueTxtRecord(mdnsName: string, bridgeId: string, modelId: string): dnsPacket.TxtAnswer {
    return {
      type: "TXT",
      class: "IN",
      ttl: 4500,
      name: mdnsName,
      data: [`bridgeid=${bridgeId}`, `modelid=${modelId}`],
    };
  }
}
