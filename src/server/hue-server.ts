import { HueBuilder } from "../builder/hue-builder";
import { HueFallback } from "./api/hue-fallback";
import { descriptionXml } from "../util/description-xml";
import { HueS } from "./lib/hue-s";
import { HueSFastify } from "./lib/hue-s-fastify";
import { HueSRequest } from "./lib/hue-s-request";
import { HueSResponse } from "./lib/hue-s-response";
import { HueServerCallbacks } from "./hue-server-callbacks";
import { HueApiV1Handler } from "./api/v1/hue-api-v1-handler";
import util from "util";

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
    private callbacks: HueServerCallbacks
  ) {
    this.app = new HueSFastify(this.builder);
    this.app.setDefaultResponseHeaders({
      Server: "nginx",
      "Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
      Pragma: "no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, HEAD",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "3600",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-XSS-Protection": "1; mode=block",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'",
      "Referrer-Policy": "no-referrer",
      Connection: "close", // This is important. Otherwise, some clients may fail
    });

    this.app.get("/description.xml", this.onDescriptionXml);

    // API v1
    new HueApiV1Handler(this.app, this.builder, this.callbacks);

    // Fallback
    new HueFallback(this.app, this.builder, this.callbacks);

    this.app.startServer(() => {
      // nothing to do so far
    });

    this.app.registerOnRequest((req) => {
      this.builder.logger.debug(
        `>> Request: (${req.method}) ${req.url}
From: ${util.inspect(HueServer.getIps(req), { colors: true })}
Headers:
${util.inspect(req.headers, { colors: true })}
Body:
${util.inspect(req.body, { colors: true, depth: 10 })}`
      );
    });

    this.app.registerOnResponse((req, status, payload, headers) => {
      this.builder.logger.debug(
        `<< Response: (${req.method}) ${req.url}
To: ${util.inspect(HueServer.getIps(req), { colors: true })}
Status: ${util.inspect(status, { colors: true })}
Headers:
${util.inspect(headers, { colors: true })}
Body:
${util.inspect(payload, { colors: true, depth: 10, compact: false })}`
      );
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

  private onDescriptionXml = (req: HueSRequest, res: HueSResponse) => {
    res.setContentType("application/xml");
    res.send(descriptionXml(this.builder));
  };
}
