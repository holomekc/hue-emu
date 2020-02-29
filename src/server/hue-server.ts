import * as bodyParser from 'body-parser';
import express from 'express';
import {Express, Request, Response} from 'express';
import * as http from 'http';
import * as https from 'https';
import {HueBuilder} from '../builder/hue-builder';
import {HueError} from '../error/hue-error';
import {isUndefined} from '../util/utils';
import {HueFallback} from './hue-fallback';
import {HueGroupsApi} from './hue-groups-api';
import {HueLightsApi} from './hue-lights-api';
import {HueServerCallback} from './hue-server-callback';
import {ErrorResponse} from '../response/error-response';
import {discovery} from '../util/discovery';

/**
 * Responsible for handling actual calls
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueServer {

    private readonly app: Express;

    constructor(private builder: HueBuilder, private callbacks: HueServerCallback) {

        this.app = express();
        this.app.use(bodyParser.json({type: '*/*'}));

        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use((req, res, next) => {
            res.append('Access-Control-Allow-Origin', ['*']);
            res.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
            res.append('Access-Control-Allow-Credentials', 'true');
            res.append('Access-Control-Max-Age', '3600');
            res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.append('Connection', 'close'); // This is important. Otherwise some clients may fail
            next();
        });

        this.app.get('/api/discovery.xml', this.onDiscovery);

        // 1. Lights API
        new HueLightsApi(this.app, this.builder, this.callbacks);

        // 2. Groups API
        new HueGroupsApi(this.app, this.builder, this.callbacks);

        // 3. Schedules API

        // 4. Scenes API

        // 6. Sensors API

        // 7. Configuration API
        if (this.callbacks.onPairing) {
            this.app.post('/api', this.onPairing);
        }
        if (this.callbacks.onConfig) {
            this.app.get('/api/config', this.onConfig);
        }
        if (this.callbacks.onAll) {
            this.app.get('/api/:username', this.onAll);
        }

        // 8. Info API (deprecated as of 1.15)

        // 9. Resourcelinks API

        // 10. Capabilities API

        // Fallback
        new HueFallback(this.app, this.builder, this.callbacks);

        const httpServer = http.createServer(this.app);

        httpServer.listen(this.builder.port, this.builder.host, () => {
            this.builder.logger.debug(`HueServer: Http-Server listening ${this.builder.host}:${this.builder.port}`);
        });

        if (this.builder.httpsConfig) {
            const options = {
                key: this.builder.httpsConfig.key,
                cert: this.builder.httpsConfig.cert,
                rejectUnauthorized: false,
            };

            const httpsServer = https.createServer(options, this.app);

            httpsServer.listen(this.builder.httpsConfig.port, this.builder.host, () => {
                this.builder.logger.debug(`HueServer: Https-Server listening ${this.builder.host}:${this.builder.httpsConfig?.port}`);
            });
        }
    }

    private onDiscovery = (req: Request, res: Response) => {
        this.builder.logger.debug(`HueServer: Incoming discovery request.`);
        res.contentType('application/xml');
        res.send(discovery(this.builder.discoveryHost, this.builder.discoveryPort, this.builder.udn));
    };

    private onPairing = (req: Request, res: Response) => {
        this.builder.logger.debug(`HueServer: Incoming pairing request:\n${JSON.stringify(req.body)}\n`);

        if (isUndefined(req.body.devicetype)) {
            res.json(ErrorResponse.create(HueError.PARAMETER_NOT_AVAILABLE.withParams('devicetype'), ''));
        }

        this.callbacks.onPairing!(req.body.devicetype, req.body?.generateclientkey).subscribe(username => {
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

    private onConfig = (req: Request, res: Response) => {
        this.builder.logger.debug(`HueServer: Incoming /config request`);

        this.callbacks.onConfig!().subscribe(config => {
            res.json(config);
        }, (err: HueError) => {
            res.json(ErrorResponse.create(err, '/config'));
        });
    };

    private onAll = (req: Request, res: Response) => {
        const username = req.params.username;
        this.builder.logger.debug(`HueServer: Incoming / request by=${username}`);

        this.callbacks.onAll!(username).subscribe(lights => {
            res.json(lights);
        }, (err: HueError) => {
            res.json(ErrorResponse.create(err, '/'));
        });
    };
}