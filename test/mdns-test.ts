import { HueMdns } from "../src/mdns/hue-mdns";
import { HueServer } from "../src/server/hue-server";
import { Observable, of, throwError } from "rxjs";
import { HueSRequest } from "../src/server/lib/hue-s-request";
import { HueBuilder } from "../src/builder/hue-builder";
import * as uuid from "uuid";
import { HueError } from "../src/error/hue-error";
import * as os from "os";

const networkInterfaces = os.networkInterfaces();
const selectedInterface = networkInterfaces.eth0 || networkInterfaces.en0;

let mac = "ab:ab:ab:ab:ab:ab";
let address = "0.0.0.0";

selectedInterface?.forEach(networkInterface => {
  if (networkInterface.family === "IPv4") {
    mac = networkInterface.mac;
    address = networkInterface.address;
  }
});

const udn = "800b3a3b-8e2d-47fa-8073-55ce61e064ba";

const hueBuilder = HueBuilder.builder()
  .withHost("0.0.0.0")
  .withPort(8080)
  .withHttps(undefined)
  .withDiscoveryHost(address)
  .withDiscoveryPort(8080)
  .withUdn(udn)
  .withMac(mac);

const authUsers: any = {};

let counter = 0;

const server = new HueServer(hueBuilder, {
  // onAll(req: HueSRequest, username: string): Observable<any> {
  //   console.log(req);
  //   console.log(username);
  //   return of("test");
  // },
  onConfig(): Observable<any> {
    return of({
      //name: "Philips hue",
      name: "HueEmu",
      datastoreversion: "165",
      swversion: "1961135030",
      apiversion: "1.61.0",
      mac: hueBuilder.mac, // May be checked by some clients. May also be valid value.
      bridgeid: hueBuilder.bridgeId,
      factorynew: false,
      replacesbridgeid: null,
      modelid: hueBuilder.modelId,
      starterkitid: "",
    });
  },
  onPairing(req: HueSRequest, devicetype: string, generateclientkey?: boolean): Observable<string> {
    let username;
    username = uuid.v4();
    console.log("handle random user id: " + username + " and deviceType: " + devicetype);
    if (devicetype) {
      authUsers[username] = devicetype;
    } else {
      authUsers[username] = "moos";
    }

    if (counter > 5) {
      return of(username);
    }

    counter++;

    return throwError(() => HueError.LINK_BUTTON_NOT_PRESSED);

    // pairingEnabled = false;
    //return of(username).pipe(delay(1000));
  },
});

let hueMdns = new HueMdns(hueBuilder);
