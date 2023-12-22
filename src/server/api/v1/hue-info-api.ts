import { HueApiV1 } from "./hue-api-v1";
import { HueS } from "../../lib/hue-s";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";

export class HueInfoApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 8. Info API (deprecated as of 1.15)
    if (this.callbacks.v1?.getAllTimezones) {
      this.app.get("/api/:username/info/timezones", this.getAllTimezones);
    }
  }

  private getAllTimezones = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllTimezones!(req, username).subscribe(this.defaultSubscription(res, "/info/timezones"));
  };
}
