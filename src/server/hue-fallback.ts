import { HueError } from "../error/hue-error";
import { HueBuilder } from "../builder/hue-builder";
import { ErrorResponse } from "../response/error-response";
import { isDefined } from "../util/utils";
import { HueServerCallback } from "./hue-server-callback";
import { HueS } from "./lib/hue-s";
import { HueSRequest } from "./lib/hue-s-request";
import { HueSResponse } from "./lib/hue-s-response";

export class HueFallback {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallback
  ) {
    // Fallback
    this.app.get("*", this.onFallback);
    this.app.post("*", this.onFallback);
    this.app.put("*", this.onFallback);
    this.app.delete("*", this.onFallback);
  }

  private onFallback = (req: HueSRequest, res: HueSResponse) => {
    if (this.callbacks.onFallback) {
      this.callbacks.onFallback(req, res).subscribe({
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
