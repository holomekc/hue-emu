import { HueBuilder } from "../builder/hue-builder";
import { HueError } from "../error/hue-error";
import { isUndefined } from "../util/utils";
import { HueFallback } from "./hue-fallback";
import { HueGroupsApi } from "./hue-groups-api";
import { HueLightsApi } from "./hue-lights-api";
import { HueServerCallback } from "./hue-server-callback";
import { ErrorResponse } from "../response/error-response";
import { discovery } from "../util/discovery";
import { HueS } from "./lib/hue-s";
import { HueSFastify } from "./lib/hue-s-fastify";
import { HueSRequest } from "./lib/hue-s-request";
import { HueSResponse } from "./lib/hue-s-response";

/**
 * Responsible for handling actual calls
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueServer {
  private readonly app: HueS;

  constructor(
    private builder: HueBuilder,
    private callbacks: HueServerCallback
  ) {
    this.app = new HueSFastify(this.builder);
    this.app.setDefaultResponseHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, HEAD",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "3600",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      Connection: "close", // This is important. Otherwise some clients may fail
    });

    this.app.get("/description.xml", this.onDiscovery);

    // 1. Lights API
    new HueLightsApi(this.app, this.builder, this.callbacks);

    // 2. Groups API
    new HueGroupsApi(this.app, this.builder, this.callbacks);

    // 3. Schedules API

    // 4. Scenes API

    // 6. Sensors API

    // 7. Configuration API
    if (this.callbacks.onPairing) {
      this.app.post("/api", this.onPairing);
      // Harmony does that. But only for pairing. Everything else looks normal.
      this.app.post("/api/", this.onPairing);
    }
    if (this.callbacks.onConfig) {
      this.app.get("/api/config", this.onConfig);
    }
    if (this.callbacks.onAll) {
      this.app.get("/api/:username", this.onAll);
    }

    // 8. Info API (deprecated as of 1.15)

    // 9. Resourcelinks API

    // 10. Capabilities API

    // Fallback
    new HueFallback(this.app, this.builder, this.callbacks);

    this.app.startServer(() => {
      // nothing to do so far
    });

    this.app.registerOnRequest((req) => {
      if (req.body) {
        this.builder.logger.debug(
          `HueServer: Incoming ${req.method} ${req.url} request from ${HueServer.getIps(req)}.\nBody:\n${JSON.stringify(
            req.body
          )}`
        );
      } else {
        this.builder.logger.debug(`HueServer: Incoming ${req.method} ${req.url} request from ${HueServer.getIps(req)}`);
      }
      this.builder.logger.fine(`HueServer: Headers:\n${JSON.stringify(req.headers)}`);
    });

    this.app.registerOnResponse((payload, headers) => {
      if (payload) {
        this.builder.logger.debug(`HueServer: Send response.\nBody:\n${JSON.stringify(payload)}`);
      } else {
        this.builder.logger.debug(`HueServer: Send empty response.`);
      }
      this.builder.logger.fine(`HueServer: Headers:\n${JSON.stringify(headers)}`);
    });
  }

  public stop(): void {
    this.app.stopServer();
  }

  private static getIps(req: HueSRequest): string {
    if (req.ips && req.ips.length > 0) {
      return req.ips.join(",");
    }
    return req.ip;
  }

  private onDiscovery = (req: HueSRequest, res: HueSResponse) => {
    res.setContentType("application/xml");
    res.send(discovery(this.builder.discoveryHost, this.builder.discoveryPort, this.builder.udn, this.builder.mac));
  };

  private onPairing = (req: HueSRequest, res: HueSResponse) => {
    if (isUndefined(req.body.devicetype)) {
      res.json(ErrorResponse.create(HueError.PARAMETER_NOT_AVAILABLE.withParams("devicetype"), ""));
    }

    this.callbacks.onPairing!(req, req.body.devicetype, req.body?.generateclientkey).subscribe(
      (username) => {
        const response = [
          {
            success: {
              username: username,
            },
          },
        ];
        res.json(response);
      },
      (err: HueError) => {
        res.json([ErrorResponse.create(err, "")]);
      }
    );
  };

  private onConfig = (req: HueSRequest, res: HueSResponse) => {
    this.callbacks.onConfig!(req).subscribe(
      (config) => {
        res.json(config);
      },
      (err: HueError) => {
        res.json([ErrorResponse.create(err, "/config")]);
      }
    );
  };

  private onAll = (req: HueSRequest, res: HueSResponse) => {
    const username = req.params.username;
    this.callbacks.onAll!(req, username).subscribe(
      (lights) => {
        res.json(lights);
      },
      (err: HueError) => {
        res.json([ErrorResponse.create(err, "/")]);
      }
    );
  };
}
