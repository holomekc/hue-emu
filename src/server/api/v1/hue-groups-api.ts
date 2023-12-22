import { ErrorResponse } from "../../../response/error-response";
import { HueS } from "../../lib/hue-s";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueBuilder } from "../../../builder/hue-builder";
import { EMPTY, merge, Observable, tap, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { HueGroupError } from "../../../error/hue-group-error";
import { HueApiV1 } from "./hue-api-v1";

export class HueGroupsApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 2. Groups API
    if (this.callbacks.v1?.getAllGroups) {
      this.app.get("/api/:username/groups", this.getAllGroups);
    }
    if (this.callbacks.v1?.createGroup) {
      this.app.post("/api/:username/groups", this.createGroup);
    }
    if (this.callbacks.v1?.getGroupAttributes) {
      this.app.get("/api/:username/groups/:id", this.getGroupAttributes);
    }
    if (this.callbacks.v1?.setGroupAttributes) {
      this.app.put("/api/:username/groups/:id", this.setGroupAttributes);
    }
    if (this.callbacks.v1?.setGroupState) {
      this.app.put("/api/:username/groups/:id/action", this.setGroupState);
    }
    if (this.callbacks.v1?.deleteGroup) {
      this.app.delete("/api/:username/groups/:id", this.deleteGroup);
    }
  }

  private getAllGroups = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllGroups!(req, username).subscribe(this.defaultSubscription(res, "/groups"));
  };

  private createGroup = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.createGroup!(req, username, req.body).subscribe(
      this.defaultCreationSubscription(res, "/groups")
    );
  };

  private getGroupAttributes = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const groupId = req.params.id;
    this.callbacks.v1!.getGroupAttributes!(req, username, groupId).subscribe(this.defaultSubscription(res, "/groups"));
  };

  private setGroupAttributes = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const groupId = req.params.id;
    this.callbacks.v1!.setGroupAttributes!(
      req,
      username,
      groupId,
      req.body?.name,
      req.body?.lights,
      req.body?.class
    ).subscribe(this.defaultSubscription(res, "/groups"));
  };

  private setGroupState = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const groupId = req.params.id;

    const observables: Observable<any>[] = [];
    const response: any[] = [];

    Object.entries(this.callbacks.v1!.setGroupState!(req, username, groupId, req.body)).forEach(([key, stream]) => {
      observables.push(
        stream.pipe(
          catchError((err) => {
            if (err instanceof HueGroupError) {
              return throwError(() => err.error);
            }
            const name = `/groups/${groupId}/action/${key}`;
            const item: any = {
              error: ErrorResponse.createMessage(err, `${name}`),
            };
            response.push(item);
            return EMPTY;
          }),
          tap((value) => {
            const name = `/groups/${groupId}/action/${key}`;
            const item: any = {
              success: {
                [name]: value,
              },
            };
            response.push(item);
          })
        )
      );
    });

    merge(...observables).subscribe({
      error: (err) => {
        res.json([ErrorResponse.create(err, `/groups/${groupId}`)]);
      },
      complete: () => {
        res.json(response);
      },
    });
  };

  private deleteGroup = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const groupId = req.params.id;
    this.callbacks.v1!.deleteGroup!(req, username, groupId).subscribe(
      this.defaultDeletionSubscription(res, `/groups/${groupId}`)
    );
  };
}
