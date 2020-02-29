import {Express, Request, Response} from 'express';
import {HueError} from '../error/hue-error';
import {HueBuilder} from '../builder/hue-builder';
import {ErrorResponse} from '../response/error-response';
import {isDefined} from '../util/utils';
import {HueServerCallback} from './hue-server-callback';

export class HueFallback {

    constructor(private app: Express, private builder: HueBuilder, private callbacks: HueServerCallback) {
        // Fallback
        this.app.get('*', this.onFallback);
        this.app.post('*', this.onFallback);
        this.app.put('*', this.onFallback);
        this.app.delete('*', this.onFallback);
    }

    private onFallback = (req: Request, res: Response) => {
        this.builder.logger.fine(`HueServer: Incoming ${req.method} ${req.url} request`);

        if(this.callbacks.onFallback) {
            this.callbacks.onFallback(req, res).subscribe(response => {
                if (isDefined(response)) {
                    res.json(response);
                }
            }, (err: HueError) => {
                res.json(ErrorResponse.create(err, '/fallback'));
            });
        } else {
            res.json({});
        }
    };
}