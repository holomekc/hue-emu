import { HueError } from "./error/hue-error";
import { HueBuilder } from "../../../builder/hue-builder";
import { ErrorResponse } from "./response/error-response";
import { isDefined } from "../../../util/utils";
import { HueS } from "../../lib/hue-s";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";
import { HueServerCallbacks } from "../../hue-server-callbacks";

export class HueFallback {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    // Fallback
    this.app.get("/api*", this.onFallback);
    this.app.post("/api*", this.onFallback);
    this.app.put("/api*", this.onFallback);
    this.app.delete("/api*", this.onFallback);
  }

  private onFallback = (req: HueSRequest, res: HueSResponse) => {
    this.builder.logger.debug("HueFallback: No other handler answered to the request. Fallback triggered.");

    if (this.callbacks.v1?.fallback) {
      this.callbacks.v1!.fallback!(req, res).subscribe({
        next: (response) => {
          if (isDefined(response)) {
            res.json(response);
          }
        },
        error: (err: HueError) => {
          res.json([ErrorResponse.create(err, "/fallback")]);
        },
      });
    } else {
      res.json({});
    }
  };
}
