import { HueS } from "../../lib/hue-s";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";
import { isUndefined } from "../../../util/utils";
import { ErrorResponse } from "../../../response/error-response";
import { HueError } from "../../../error/hue-error";
import { HueApiV1 } from "./hue-api-v1";

export class HueConfigurationApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();

    // 7. Configuration API
    if (this.callbacks.v1?.createUser) {
      this.app.post("/api", this.createUser);
      // Harmony does that. But only for pairing. Everything else looks normal.
      this.app.post("/api/", this.createUser);
    }
    if (this.callbacks.v1?.getFullState) {
      this.app.get("/api/:username", this.getFullState);
    }
    if (this.callbacks.v1?.getConfig) {
      this.app.get("/api/config", this.getConfig);
      this.app.get("/api/:username/config", this.getConfig);
    }
    if (this.callbacks.v1?.modifyConfig) {
      this.app.put("/api/:username/config", this.modifyConfig);
    }
    if (this.callbacks.v1?.deleteUser) {
      this.app.put("/api/:appKey/config/whitelist/:element", this.deleteUser);
    }
  }

  private createUser = (req: HueSRequest, res: HueSResponse) => {
    if (isUndefined(req.body)) {
      res.json(ErrorResponse.create(HueError.MISSING_PARAMETERS, ""));
    } else if (isUndefined(req.body.devicetype)) {
      res.json(ErrorResponse.create(HueError.PARAMETER_NOT_AVAILABLE.withParams("devicetype"), ""));
    }

    this.callbacks.v1!.createUser!(req, req.body.devicetype, req.body?.generateclientkey).subscribe({
      next: (username) => {
        const response = [
          {
            success: {
              username: username,
            },
          },
        ];
        res.json(response);
      },
      error: (err: HueError) => {
        res.json([ErrorResponse.create(err, "")]);
      },
    });
  };

  private getConfig = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getConfig!(req, username).subscribe(this.defaultSubscription(res, "/config"));
  };

  private getFullState = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getFullState!(req, username).subscribe(this.defaultSubscription(res, "/"));
  };

  private modifyConfig = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const groupId = req.params.id;
    this.callbacks.v1!.modifyConfig!(req, username, req.body).subscribe(this.defaultSubscription(res, "/config"));
  };

  private deleteUser = (req: HueSRequest, res: HueSResponse) => {
    const appKey = req.params.appKey; // aka username...
    const element = req.params.element;
    this.callbacks.v1!.deleteUser!(req, appKey, element).subscribe(
      this.defaultDeletionSubscription(res, `/config/whitelist/${element}`)
    );
  };
}
