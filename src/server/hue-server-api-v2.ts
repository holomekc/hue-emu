import { HueSRequest } from "./lib/hue-s-request";
import { Observable } from "rxjs";

export interface HueServerApiV2 {

  // resource/light
  getAllLights?(req: HueSRequest, username: string): Observable<any>;
}