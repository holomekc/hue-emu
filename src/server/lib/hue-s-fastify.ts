import {HueBuilder} from '../../builder/hue-builder';
import {HueS} from './hue-s';
import {HueSRequest, ParamsDictionary} from './hue-s-request';
import {HueSResponse} from './hue-s-response';
import fastify, {
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
    HookHandlerDoneFunction,
} from 'fastify';

export class HueSFastify extends HueS {

    private http: FastifyInstance;
    private https: FastifyInstance | undefined;

    constructor(builder: HueBuilder) {
        super(builder);
        this.http = fastify();

        if (this.builder.httpsConfig) {
            this.https = fastify({
                https: {
                    key: this.builder.httpsConfig.key,
                    cert: this.builder.httpsConfig.cert,
                    rejectUnauthorized: false // This is not secure. But this is for local usage anyway.
                }
            });
        }
    }

    startServer(onReady: () => void): void {
        this.http.listen(this.builder.port, this.builder.host, (err, address) => {
            if (err) throw err;
            this.builder.logger.info(`HueServer: Http-Server listening ${this.builder.host}:${this.builder.port}`);
        });

        if (this.https && this.builder.httpsConfig) {
            this.https.listen(this.builder.httpsConfig.port, this.builder.host, (err, address) => {
                if (err) throw err;
                this.builder.logger.info(`HueServer: Https-Server listening ${this.builder.host}:${this.builder.httpsConfig?.port}`);
            });
        }

        this.http.ready(err => {
            if(err) throw err;
            if (this.https) {
                this.https.ready(err => {
                    if (err) throw err;
                    onReady();
                });
            } else {
                onReady();
            }
        });
    }

    private viaInstance(callback: (instance: FastifyInstance) => void) {
        callback(this.http);
        if (this.https) {
            callback(this.https);
        }
    }

    setDefaultResponseHeaders(headers: { [header: string]: string }): void {
        this.viaInstance(instance => {
           instance.addHook('preHandler', this.headerHook(headers));
        });
    }

    private headerHook(headers: { [p: string]: string }) {
        return (request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) => {
            Object.keys(headers).forEach(key => {
                reply.header(key, headers[key]);
            });
            next();
        };
    }

    delete(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
        this.viaInstance(instance => {
            instance.delete(path, this.handler(callback));
        });
    }

    get(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
        this.viaInstance(instance => {
            instance.get(path, this.handler(callback));
        });
    }

    post(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
        this.viaInstance(instance => {
            instance.post(path, this.handler(callback));
        });
    }

    put(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void {
        this.viaInstance(instance => {
            instance.put(path, this.handler(callback));
        });
    }

    private handler(callback: (req: HueSRequest, res: HueSResponse) => void) {
        return (request: FastifyRequest, reply: FastifyReply) => {
            callback({
                url: request.url,
                method: request.method,
                body: request.body,
                params: request.params as ParamsDictionary,
                ip: request.ip,
                headers: request.headers
            }, this.responseHandler(reply));
        }
    }

    private responseHandler(reply: FastifyReply) {
        return {
            setContentType(contentType: string) {
                reply.header('Content-Type', contentType);
            },
            send(data: string) {
                reply.send(data);
            },
            json(data: any) {
                reply.send(data)
            }
        }
    }

    registerOnRequest(callback: (req: HueSRequest) => void): void {
        this.viaInstance(instance => {
            instance.addHook('onRequest', (request, reply, done) => {
                this.handler(callback)(request, reply);
                done();
            });
        });
    }

    registerOnResponse(callback: (payload: any, headers: any) => void): void {
        this.viaInstance(instance => {
            instance.addHook('onSend', (request, reply, payload, done) => {
                callback(payload, reply.getHeaders());
                done();
            });
        });
    }
}