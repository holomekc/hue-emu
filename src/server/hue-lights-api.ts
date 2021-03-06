import {EMPTY, merge} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {HueBuilder} from '../builder/hue-builder';
import {HueError} from '../error/hue-error';
import {ErrorResponse} from '../response/error-response';
import {isDefined} from '../util/utils';
import {HueServerCallback} from './hue-server-callback';
import {HueS} from './lib/hue-s';
import {HueSRequest} from './lib/hue-s-request';
import {HueSResponse} from './lib/hue-s-response';

export class HueLightsApi {

    constructor(private app: HueS, private builder: HueBuilder, private callbacks: HueServerCallback) {
        // 1. Lights API
        if (this.callbacks.onLights) {
            this.app.get('/api/:username/lights', this.onLights);
        }
        if (this.callbacks.onLightsNew) {
            this.app.get('/api/:username/lights/new', this.onLightsNew);
        }
        if (this.callbacks.onLightsSearchNew) {
            this.app.post('/api/:username/lights', this.onLightsSearchNew);
        }
        if (this.callbacks.onLight) {
            this.app.get('/api/:username/lights/:id', this.onLight);
        }
        if (this.callbacks.onLightsRename) {
            this.app.put('/api/:username/lights/:id', this.onLightsRename);
        }
        if (this.callbacks.onLightsState) {
            this.app.put('/api/:username/lights/:id/state', this.onLightsState);
        }
        if (this.callbacks.onLightsDelete) {
            this.app.delete('/api/:username/lights/:id', this.onLightsDelete);
        }
    }

    private onLights = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;

        this.callbacks.onLights!(req, username).subscribe(lights => {
            res.json(lights);
        }, (err: HueError) => {
            res.json([ErrorResponse.create(err, '/lights')]);
        });
    };

    private onLightsNew = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;

        this.callbacks.onLightsNew!(req, username).subscribe(lights => {
            res.json(lights);
        }, (err: HueError) => {
            res.json([ErrorResponse.create(err, '/lights/new')]);
        });
    };

    private onLightsSearchNew = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;

        this.callbacks.onLightsSearchNew!(req, username, req.body?.deviceid).subscribe(() => {
            res.json([{
                success: {'/lights': 'Searching for new devices'}
            }]);
        }, (err: HueError) => {
            res.json([ErrorResponse.create(err, '/lights')]);
        });
    };

    private onLight = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;
        const lightId = req.params.id;

        this.callbacks.onLight!(req, username, lightId).subscribe(light => {
            res.json(light);
        }, (err: HueError) => {
            res.json([ErrorResponse.create(err, `/lights/${lightId}`)]);
        });
    };

    private onLightsRename = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;
        const lightId = req.params.id;

        if (!req.body?.name) {
            res.json(ErrorResponse.create(HueError.PARAMETER_NOT_AVAILABLE.withParams('name'), `/lights/${lightId}`));
            return;
        }

        this.callbacks.onLightsRename!(req, username, lightId, req.body.name).subscribe(light => {
            res.json(light);
        }, (err: HueError) => {
            res.json([ErrorResponse.create(err, `/lights/${lightId}`)]);
        });
    };

    private onLightsState = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;
        const lightId = req.params.id;

        const response: any[] = [];

        let currentLight = {};

        const observables: any = [];

        Object.keys(req.body).forEach((key) => {
            const value = req.body[key];
            this.builder.logger.fine(`HueServer: Set key=${key} to value=${value}`);

            observables.push(this.callbacks.onLightsState!(req, username, lightId, key, value).pipe(catchError(err => {
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
                    this.builder.logger.fine(`HueServer: New light state:\n${JSON.stringify((currentLight as any).state)}\n`);
                }
                res.json(response);
            }
        });
    };

    private onLightsDelete = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;
        const lightId = req.params.id;

        this.callbacks.onLightsDelete!(req, username, lightId).subscribe(light => {
            res.json(light);
        }, (err: HueError) => {
            res.json([ErrorResponse.create(err, `/lights/${lightId}`)]);
        });
    };
}