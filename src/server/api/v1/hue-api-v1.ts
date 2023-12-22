import { HueApi } from "../hue-api";
import { HueError } from "./error/hue-error";
import { ErrorResponse } from "./response/error-response";
import { HueSResponse } from "../../lib/hue-s-response";
import { Observer } from "rxjs";

export abstract class HueApiV1 extends HueApi {
  protected defaultSubscription<T>(res: HueSResponse, address: string): Partial<Observer<T>> {
    return {
      next: (value: any) => {
        res.json(value);
      },
      error: (err: HueError) => {
        res.json([ErrorResponse.create(err, address)]);
      },
    };
  }

  protected defaultDeletionSubscription<T>(res: HueSResponse, address: string): Partial<Observer<T>> {
    return {
      next: (value: any) => {
        res.json([
          {
            success: `${address} deleted.`,
          },
        ]);
      },
      error: (err: HueError) => {
        res.json([ErrorResponse.create(err, address)]);
      },
    };
  }

  protected defaultCreationSubscription<T>(res: HueSResponse, address: string): Partial<Observer<T>> {
    return {
      next: (id: any) => {
        res.json([
          {
            success: {
              id: id,
            },
          },
        ]);
      },
      error: (err: HueError) => {
        res.json([ErrorResponse.create(err, address)]);
      },
    };
  }
}
