import { HueApiV1 } from "./hue-api-v1";
import { HueS } from "../../lib/hue-s";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";

export class HueCapabilitiesApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 10. Capabilities API
    if (this.callbacks.v1?.getAllCapabilities) {
      this.app.get("/api/:username/capabilities", this.getAllCapabilities);
    }
  }

  private getAllCapabilities = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllCapabilities!(req, username).subscribe(this.defaultSubscription(res, "/capabilities"));
  };
}