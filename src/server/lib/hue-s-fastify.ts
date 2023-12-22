import { HueBuilder } from "../../builder/hue-builder";
import { HueS } from "./hue-s";
import { HueSRequest, ParamsDictionary } from "./hue-s-request";
import { HueSResponse } from "./hue-s-response";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { fastifyFormbody } from "@fastify/formbody";

export class HueSFastify extends HueS {
  private readonly http: FastifyInstance;
  private readonly https: FastifyInstance | undefined;

  constructor(builder: HueBuilder) {
    super(builder);
    this.http = fastify({
      trustProxy: true, // needed in case used behind proxy
    });
    this.additionalRegistration(this.http);

    if (this.builder.httpsConfig) {
      this.https = fastify({
        https: {
          key: this.builder.httpsConfig.key,
          cert: this.builder.httpsConfig.cert,
          rejectUnauthorized: false, // This is not secure. But this is for local usage anyway.
        },
        trustProxy: true, // needed in case used behind proxy
      });
      this.additionalRegistration(this.https);
    }
  }

  startServer(onReady: () => void): void {
    this.http.listen(
      {
        port: this.builder.port,
        host: this.builder.host,
      },
      (err, _address) => {
        if (err) throw err;
        this.builder.logger.info(`HueServer: Http-Server listening ${this.builder.host}:${this.builder.port}`);
      }
    );

    if (this.https && this.builder.httpsConfig) {
      this.https.listen(
        {
          port: this.builder.httpsConfig.port,
          host: this.builder.host,
        },
        (err, _address) => {
          if (err) throw err;
          this.builder.logger.info(
            `HueServer: Https-Server listening ${this.builder.host}:${this.builder.httpsConfig?.port}`
          );
        }
      );
    }

    this.http.ready((err) => {
      if (err) throw err;
      if (this.https) {
        this.https.ready((err) => {
          if (err) throw err;
          onReady();
        });
      } else {
        onReady();
      }
    });
  }

  stopServer() {
    this.viaInstance((instance) => {
      instance.close().then(() => {
        this.builder.logger.info("Server stopped");
      });
    });
  }

  private viaInstance(callback: (instance: FastifyInstance) => void) {
    callback(this.http);
    if (this.https) {
      callback(this.https);
    }
  }

  setDefaultResponseHeaders(headers: { [header: string]: string }): void {
    this.viaInstance((instance) => {
      instance.addHook("preHandler", this.headerHook(headers));
    });
  }

  private headerHook(headers: { [p: string]: string }) {
    return (_request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) => {
      Object.keys(headers).forEach((key) => {
        reply.header(key, headers[key]);
      });
      next();
    };
  }

  delete(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
    this.viaInstance((instance) => {
      instance.delete(path, this.handler(callback));
    });
  }

  get(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
    this.viaInstance((instance) => {
      instance.get(path, this.handler(callback));
    });
  }

  post(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
    this.viaInstance((instance) => {
      instance.post(path, this.handler(callback));
    });
  }

  put(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
    this.viaInstance((instance) => {
      instance.put(path, this.handler(callback));
    });
  }

  private handler(callback: (req: HueSRequest, res: HueSResponse) => void) {
    return (request: FastifyRequest, reply: FastifyReply) => {
      callback(this.requestHandler(request), this.responseHandler(reply));
    };
  }

  private requestHandler(request: FastifyRequest): HueSRequest {
    return {
      url: request.url,
      method: request.method,
      body: request.body,
      params: request.params as ParamsDictionary,
      ip: request.ip,
      ips: request.ips,
      headers: request.headers,
    };
  }

  private responseHandler(reply: FastifyReply) {
    return {
      setContentType: (contentType: string) => {
        reply.header("Content-Type", contentType);
      },
      send: (data: string) => {
        reply.send(data);
      },
      json: (data: any) => {
        reply.send(data);
      },
    };
  }

  registerOnRequest(callback: (req: HueSRequest) => void): void {
    this.viaInstance((instance) => {
      instance.addHook("preValidation", (request, reply, done) => {
        this.handler(callback)(request, reply);
        done();
      });
    });
  }

  registerOnResponse(callback: (req: HueSRequest, status: number, payload: any, headers: any) => void): void {
    this.viaInstance((instance) => {
      instance.addHook("preSerialization", (request, reply, payload, done) => {
        callback(this.requestHandler(request), reply.statusCode, payload, reply.getHeaders());
        done();
      });
    });
  }

  private additionalRegistration(instance: FastifyInstance) {
    // This is for Essentials. I have no words for this: Sending application/x-www-form-urlencoded in header,
    // but then the content is a json...
    instance.register(fastifyFormbody, {
      parser: (str) => {
        if (str) {
          return JSON.parse(str);
        } else {
          return undefined;
        }
      },
    });
  }
}
