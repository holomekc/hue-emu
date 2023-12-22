import { HueServerApiV1 } from "./hue-server-api-v1";
import { HueSRequest } from "./lib/hue-s-request";
import { HueSResponse } from "./lib/hue-s-response";
import { Observable } from "rxjs";

export interface HueServerCallbacks {
  v1?: HueServerApiV1;

  // Fallback
  onFallback?(req: HueSRequest, res: HueSResponse): Observable<any>;
}
