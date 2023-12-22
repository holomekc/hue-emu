import { HueApiV1 } from "./hue-api-v1";
import { HueS } from "../../lib/hue-s";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";

export class HueScenesApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 4. Scenes API
    if (this.callbacks.v1?.getAllScenes) {
      this.app.get("/api/:username/scenes", this.getAllScenes);
    }
    if (this.callbacks.v1?.createScene) {
      this.app.post("/api/:username/scenes", this.createScene);
    }
    if (this.callbacks.v1?.getScene) {
      this.app.get("/api/:username/scenes/:id", this.getScene);
    }
    if (this.callbacks.v1?.modifyScene) {
      this.app.put("/api/:username/scenes/:id", this.modifyScene);
    }
    if (this.callbacks.v1?.modifySceneLightStates) {
      this.app.put("/api/:username/scenes/:id/lightstates/:lightStatesId", this.modifySceneLightStates);
    }
    if (this.callbacks.v1?.deleteScene) {
      this.app.delete("/api/:username/scenes/:id", this.deleteScene);
    }
  }

  private getAllScenes = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllScenes!(req, username).subscribe(this.defaultSubscription(res, "/scenes"));
  };

  private createScene = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.createScene!(req, username, req.body).subscribe(
      this.defaultCreationSubscription(res, "/scenes")
    );
  };

  private getScene = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sceneId = req.params.id;
    this.callbacks.v1!.getScene!(req, username, sceneId).subscribe(this.defaultSubscription(res, `/scenes/${sceneId}`));
  };

  private modifyScene = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sceneId = req.params.id;
    this.callbacks.v1!.modifyScene!(req, username, sceneId, req.body).subscribe(
      this.defaultSubscription(res, `/scenes/${sceneId}`)
    );
  };

  private modifySceneLightStates = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sceneId = req.params.id;
    const lightStatesId = req.params.lightStatesId;
    this.callbacks.v1!.modifySceneLightStates!(req, username, sceneId, lightStatesId, req.body).subscribe(
      this.defaultSubscription(res, `/scenes/${sceneId}/lightstates/${lightStatesId}`)
    );
  };

  private deleteScene = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sceneId = req.params.id;
    this.callbacks.v1!.deleteScene!(req, username, sceneId).subscribe(
      this.defaultDeletionSubscription(res, `/scenes/${sceneId}`)
    );
  };
}
