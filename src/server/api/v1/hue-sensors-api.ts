import { HueApiV1 } from "./hue-api-v1";
import { HueS } from "../../lib/hue-s";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";
import { ErrorResponse } from "../../../response/error-response";
import { HueError } from "../../../error/hue-error";

export class HueSensorsApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 6. Sensors API
    if (this.callbacks.v1?.getAllSensors) {
      this.app.get("/api/:username/sensors", this.getAllSensors);
    }
    if (this.callbacks.v1?.createSensor || this.callbacks.v1?.findNewSensors) {
      this.app.post("/api/:username/sensors", this.createSensorOrFindNewOnes);
    }
    if (this.callbacks.v1?.getNewSensors) {
      this.app.get("/api/:username/sensors/new", this.getNewSensors);
    }
    if (this.callbacks.v1?.getSensor) {
      this.app.get("/api/:username/sensors/:id", this.getSensor);
    }
    if (this.callbacks.v1?.updateSensor) {
      this.app.put("/api/:username/sensors/:id", this.updateSensor);
    }
    if (this.callbacks.v1?.changeSensorConfig) {
      this.app.put("/api/:username/sensors/:id/config", this.changeSensorConfig);
    }
    if (this.callbacks.v1?.changeSensorState) {
      this.app.put("/api/:username/sensors/:id/state", this.changeSensorState);
    }
    if (this.callbacks.v1?.deleteSensor) {
      this.app.delete("/api/:username/sensors/:id", this.deleteSensor);
    }
  }

  private getAllSensors = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllSensors!(req, username).subscribe(this.defaultSubscription(res, "/sensors"));
  };

  private createSensorOrFindNewOnes = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    // We need to do more checking we are not sure if the necessary method is overwritten.
    if (req.body && Object.keys(req.body).length > 0) {
      // creation
      if(this.callbacks.v1!.createSensor) {
        this.callbacks.v1!.createSensor(req, username, req.body).subscribe(
          this.defaultCreationSubscription(res, "/sensors")
        );
      } else {
        res.json([ErrorResponse.create(HueError.SENSOR_TYPE_NOT_ALLOWED, "/sensors")]);
      }
    } else {
      // search
      if(this.callbacks.v1!.findNewSensors) {
        this.callbacks.v1!.findNewSensors(req, username).subscribe(
          this.defaultSubscription(res, "/sensors")
        );
      } else {
        res.json([ErrorResponse.create(HueError.COMMISSIONABLE_SENSOR_LIST_FULL, "/sensors")]);
      }
    }
  };

  private getNewSensors = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getNewSensors!(req, username).subscribe(this.defaultSubscription(res, "/sensors/new"));
  };

  private getSensor = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sensorId = req.params.id;
    this.callbacks.v1!.getSensor!(req, username, sensorId).subscribe(this.defaultSubscription(res, `/sensors/${sensorId}`));
  };

  private updateSensor = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sensorId = req.params.id;
    this.callbacks.v1!.updateSensor!(req, username, sensorId, req.body).subscribe(this.defaultSubscription(res, `/sensors/${sensorId}`));
  };

  private changeSensorConfig = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sensorId = req.params.id;
    this.callbacks.v1!.changeSensorConfig!(req, username, sensorId, req.body).subscribe(this.defaultSubscription(res, `/sensors/${sensorId}/config`));
  };

  private changeSensorState = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sensorId = req.params.id;
    this.callbacks.v1!.changeSensorState!(req, username, sensorId, req.body).subscribe(this.defaultSubscription(res, `/sensors/${sensorId}/state`));
  };

  private deleteSensor = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const sensorId = req.params.id;
    this.callbacks.v1!.deleteSensor!(req, username, sensorId).subscribe(
      this.defaultDeletionSubscription(res, `/sensors/${sensorId}`)
    );
  };
}