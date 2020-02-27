import * as bodyParser from 'body-parser';
import express from 'express';
import {Express, Request, Response} from 'express';
import {EMPTY, merge} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AbstractHueServer} from '../abstract-hue-server';
import {HueBuilder} from '../builder/hue-builder';
import {HueError} from '../error/hue-error';
import {PairingEvent} from '../events/pairing-event';
import {isDefined} from '../util/utils';
import {HueServerCallback} from './hue-server-callback';
import {ErrorResponse} from '../response/error-response';
import {discovery} from '../util/discovery';

/**
 * Responsible for handling actual calls
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueServer extends AbstractHueServer {

    private readonly server: Express;

    constructor(builder: HueBuilder, private callbacks: HueServerCallback) {
        super(builder);

        this.server = express();
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({extended: true}));

        this.server.post('/api', this.onPairing);
        this.server.get('/api/:username/lights', this.onLights);
        this.server.get('/api/:username/lights/:id', this.onLight);
        this.server.put('/api/:username/lights/:id/state', this.onState);
        this.server.get('/api/discovery.xml', this.onDiscovery);

        this.server.listen(this.port, this.host, () => {
            this.logger.debug(`HueServer: Server listening ${this.host}:${this.port}`);
        });
    }

    private onPairing = (req: Request, res: Response) => {
        this.logger.debug(`HueServer: Incoming pairing request:\n${JSON.stringify(req.body)}\n`);
        const user = req.body as PairingEvent;

        this.callbacks.onPairing(user).subscribe(username => {
            const response = [{
                success: {
                    username: username
                }
            }];
            res.json(response);
        }, (err: HueError) => {
            res.json(ErrorResponse.create(err, ''));
        });
    };

    private onLights = (req: Request, res: Response) => {
        const username = req.params.username;
        this.logger.debug(`HueServer: Incoming /lights request by=${username}`);

        this.callbacks.onLights(username).subscribe(lights => {
            res.json(lights);
        }, (err: HueError) => {
            res.json(ErrorResponse.create(err, '/lights'));
        });
    };

    private onLight = (req: Request, res: Response) => {
        const username = req.params.username;
        const lightId = req.params.id;
        this.logger.debug(`HueServer: Incoming /lights/${lightId} request by=${username}`);

        this.callbacks.onLight(username, lightId).subscribe(light => {
            res.json(light);
        }, (err: HueError) => {
            res.json(ErrorResponse.create(err, '/lights'));
        });
    };

    private onState = (req: Request, res: Response) => {
        const username = req.params.username;
        const lightId = req.params.id;
        this.logger.debug(`HueServer: Incoming /lights/${lightId}/state request by=${username}:\n${JSON.stringify(req.body)}\n`);

        const response: any[] = [];

        let currentLight = {};

        const observables: any = [];

        Object.keys(req.body).forEach((key) => {
            const value = req.body[key];
            this.logger.fine(`HueServer: Set key=${key} to value=${value}`);

            observables.push(this.callbacks.onState(username, lightId, key, value).pipe(catchError(err => {
                const name = `/lights/${lightId}/state/${key}`;
                const item: any = {
                    error: ErrorResponse.createMessage(err, `${name}`)
                };
                response.push(item);
                return EMPTY;
            }), map(light => {
                return {key: key, value: value, light: light};
            })));
        });

        merge(...observables).subscribe({
            next: (entry: any) => {
                const name = `/lights/${lightId}/state/${entry.key}`;
                const item: any = {
                    success: {
                        [name]: entry.value
                    }
                };

                // yes we are overwriting the current light all the time so that we have the complete object at the end
                // TODO: maybe remove this. This is just for logging the complete change. Makes it more complicated...
                currentLight = entry.light;
                response.push(item);
            },
            complete: () => {
                if (isDefined(currentLight)) {
                    this.logger.fine(`HueServer: New light state:\n${JSON.stringify((currentLight as any).state)}\n`);
                }
                res.json(response);
            }
        });
    };

    private onDiscovery = (req: Request, res: Response) => {
        this.logger.debug(`HueServer: Incoming discovery request.`);
        res.contentType('application/xml');
        res.send(discovery(this.discoveryHost, this.discoveryPort, this.udn));
    };
}