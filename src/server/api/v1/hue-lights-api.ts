import { EMPTY, merge, Observable, tap, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { HueBuilder } from "../../../builder/hue-builder";
import { HueError } from "./error/hue-error";
import { ErrorResponse } from "./response/error-response";
import { HueS } from "../../lib/hue-s";
import { HueSRequest } from "../../lib/hue-s-request";
import { HueSResponse } from "../../lib/hue-s-response";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueGroupError } from "./error/hue-group-error";
import { HueApiV1 } from "./hue-api-v1";

export class HueLightsApi extends HueApiV1 {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    super();
    // 1. Lights API
    if (this.callbacks.v1?.getAllLights) {
      this.app.get("/api/:username/lights", this.getAllLights);
    }
    if (this.callbacks.v1?.getNewLights) {
      this.app.get("/api/:username/lights/new", this.getNewLights);
    }
    if (this.callbacks.v1?.searchForNewLights) {
      this.app.post("/api/:username/lights", this.searchForNewLights);
    }
    if (this.callbacks.v1?.getLightAttributeAndState) {
      this.app.get("/api/:username/lights/:id", this.getLightAttributeAndState);
    }
    if (this.callbacks.v1?.setLightAttributes) {
      this.app.put("/api/:username/lights/:id", this.setLightAttributes);
    }
    if (this.callbacks.v1?.setLightState) {
      this.app.put("/api/:username/lights/:id/state", this.setLightState);
    }
    if (this.callbacks.v1?.deleteLights) {
      this.app.delete("/api/:username/lights/:id", this.deleteLights);
    }
  }

  private getAllLights = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getAllLights!(req, username).subscribe(this.defaultSubscription(res, "/lights"));
  };

  private getNewLights = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.v1!.getNewLights!(req, username).subscribe(this.defaultSubscription(res, "/lights/new"));
  };

  private searchForNewLights = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;

    this.callbacks.v1!.searchForNewLights!(req, username, req.body?.deviceid).subscribe({
      next: () => {
        res.json([
          {
            success: { "/lights": "Searching for new devices" },
          },
        ]);
      },
      error: (err: HueError) => {
        res.json([ErrorResponse.create(err, "/lights")]);
      },
    });
  };

  private getLightAttributeAndState = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const lightId = req.params.id;
    this.callbacks.v1!.getLightAttributeAndState!(req, username, lightId).subscribe(
      this.defaultSubscription(res, `/lights/${lightId}`)
    );
  };

  private setLightAttributes = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const lightId = req.params.id;

    if (!req.body?.name) {
      res.json(ErrorResponse.create(HueError.PARAMETER_NOT_AVAILABLE.withParams("name"), `/lights/${lightId}`));
      return;
    }

    this.callbacks.v1!.setLightAttributes!(req, username, lightId, req.body.name).subscribe(
      this.defaultSubscription(res, `/lights/${lightId}`)
    );
  };

  private setLightState = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const lightId = req.params.id;

    const observables: Observable<any>[] = [];
    const response: any[] = [];

    Object.entries(this.callbacks.v1!.setLightState!(req, username, lightId, req.body)).forEach(([key, stream]) => {
      observables.push(
        stream.pipe(
          catchError((err) => {
            if (err instanceof HueGroupError) {
              return throwError(() => err.error);
            }
            const name = `/lights/${lightId}/state/${key}`;
            const item: any = {
              error: ErrorResponse.createMessage(err, `${name}`),
            };
            response.push(item);
            return EMPTY;
          }),
          tap((value) => {
            const name = `/lights/${lightId}/state/${key}`;
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
        res.json([ErrorResponse.create(err, `/lights/${lightId}`)]);
      },
      complete: () => {
        res.json(response);
      },
    });
  };

  private deleteLights = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    const lightId = req.params.id;
    this.callbacks.v1!.deleteLights!(req, username, lightId).subscribe(
      this.defaultDeletionSubscription(res, `/lights/${lightId}`)
    );
  };
}
