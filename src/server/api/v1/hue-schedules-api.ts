import { HueS } from "../../lib/hue-s";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";
import { HueApiV1 } from "./hue-api-v1";

export class HueSchedulesApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 3. Schedules API
    if (this.callbacks.v1?.getAllSchedules) {
      this.app.get("/api/:username/schedules", this.getAllSchedules);
    }
    if (this.callbacks.v1?.createSchedule) {
      this.app.post("/api/:username/schedules", this.createSchedule);
    }
    if (this.callbacks.v1?.getScheduleAttributes) {
      this.app.get("/api/:username/schedules/:id", this.getScheduleAttributes);
    }
    if (this.callbacks.v1?.setScheduleAttributes) {
      this.app.put("/api/:username/schedules/:id", this.setScheduleAttributes);
    }
    if (this.callbacks.v1?.deleteSchedule) {
      this.app.delete("/api/:username/schedules/:id", this.deleteSchedule);
    }
  }

  private getAllSchedules = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllSchedules!(req, username).subscribe(this.defaultSubscription(res, "/schedules"));
  };

  private createSchedule = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.createSchedule!(req, username, req.body).subscribe(
      this.defaultCreationSubscription(res, "/schedules")
    );
  };

  private getScheduleAttributes = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const scheduleId = req.params.id;
    this.callbacks.v1!.getScheduleAttributes!(req, username, scheduleId).subscribe(
      this.defaultSubscription(res, "/schedules")
    );
  };

  private setScheduleAttributes = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const scheduleId = req.params.id;

    this.callbacks.v1!.setScheduleAttributes!(
      req,
      username,
      scheduleId,
      req.body?.name,
      req.body?.description,
      req.body?.command,
      req.body?.time,
      req.body?.localtime,
      req.body?.status,
      req.body?.autodelete
    ).subscribe(this.defaultSubscription(res, "/schedules"));
  };

  private deleteSchedule = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const scheduleId = req.params.id;

    this.callbacks.v1!.deleteSchedule!(req, username, scheduleId).subscribe(
      this.defaultDeletionSubscription(res, `/schedules/${scheduleId}`)
    );
  };
}
