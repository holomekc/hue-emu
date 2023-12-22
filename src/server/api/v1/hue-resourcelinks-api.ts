import { HueApiV1 } from "./hue-api-v1";
import { HueS } from "../../lib/hue-s";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";

export class HueResourcelinksApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 9. Resourcelinks API
    if (this.callbacks.v1?.getAllResourceLinks) {
      this.app.get("/api/:username/resourcelinks", this.getAllResourceLinks);
    }
    if (this.callbacks.v1?.createResourceLinks) {
      this.app.post("/api/:username/resourcelinks", this.createResourceLinks);
    }
    if (this.callbacks.v1?.getResourceLinks) {
      this.app.get("/api/:username/resourcelinks/:id", this.getResourceLinks);
    }
    if (this.callbacks.v1?.updateResourceLinks) {
      this.app.put("/api/:username/resourcelinks/:id", this.updateResourceLinks);
    }
    if (this.callbacks.v1?.deleteResourceLinks) {
      this.app.delete("/api/:username/resourcelinks/:id", this.deleteResourceLinks);
    }
  }

  private getAllResourceLinks = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllResourceLinks!(req, username).subscribe(this.defaultSubscription(res, "/resourcelinks"));
  };

  private createResourceLinks = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.createResourceLinks!(req, username, req.body).subscribe(
      this.defaultCreationSubscription(res, "/resourcelinks")
    );
  };

  private getResourceLinks = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const resourceLinksId = req.params.id;
    this.callbacks.v1!.getResourceLinks!(req, username, resourceLinksId).subscribe(
      this.defaultSubscription(res, `/resourcelinks/${resourceLinksId}`)
    );
  };

  private updateResourceLinks = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const resourceLinksId = req.params.id;
    this.callbacks.v1!.updateResourceLinks!(req, username, sceneId, req.body).subscribe(
      this.defaultSubscription(res, `/resourcelinks/${resourceLinksId}`)
    );
  };

  private deleteResourceLinks = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const resourceLinksId = req.params.id;
    this.callbacks.v1!.deleteResourceLinks!(req, username, sceneId).subscribe(
      this.defaultDeletionSubscription(res, `/resourcelinks/${resourceLinksId}`)
    );
  };
}
