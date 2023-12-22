import { Observable, of, throwError } from "rxjs";
import * as uuid from "uuid";
import * as os from "os";
import { HueBuilder, HueError, HueServer, HueMdns, HueGroupError, HueSRequest, HueSResponse } from "../src";

const networkInterfaces = os.networkInterfaces();
const selectedInterface = networkInterfaces.eth0 || networkInterfaces.en0;

let mac = "ab:ab:ab:ab:ab:ab";
let address = "0.0.0.0";

selectedInterface?.forEach((networkInterface) => {
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
  v1: {
    fallback(req: HueSRequest, res: HueSResponse): Observable<any> {
      console.log(req);
      return of({});
    },
    setGroupAttributes(
      req: HueSRequest,
      username: string,
      groupId: string,
      groupName?: string,
      lights?: string[],
      class_?: string
    ): Observable<any> {
      console.log(groupName);
      console.log(lights);
      console.log(class_);
      return of({
        test: 123,
      });
    },
    setGroupState(
      req: HueSRequest,
      username: string,
      groupId: string,
      states: { [p: string]: any }
    ): { [p: string]: Observable<any> } {
      const result: { [p: string]: Observable<any> } = {};
      Object.entries(states).forEach(([key, value]) => {
        if (key === "bri") {
          result[key] = throwError(() => HueError.INVALID_UPDATE_STATE);
        } else {
          result[key] = of({
            test: 123,
          });
        }
      });

      return result;
    },
    setLightState(
      req: HueSRequest,
      username: string,
      lightId: string,
      states: { [p: string]: any }
    ): { [p: string]: Observable<any> } {
      const result: { [p: string]: Observable<any> } = {};
      Object.entries(states).forEach(([key, value]) => {
        if (key === "bri") {
          result[key] = throwError(() => HueError.INVALID_UPDATE_STATE);
        } else if (key === "unauth") {
          result[key] = throwError(() => new HueGroupError(HueError.UNAUTHORIZED_USER));
        } else {
          result[key] = of(value);
        }
      });

      return result;
    },
    getConfig(): Observable<any> {
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
    createUser(req: HueSRequest, devicetype: string, generateclientkey?: boolean): Observable<string> {
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
  },
});

let hueMdns = new HueMdns(hueBuilder);
