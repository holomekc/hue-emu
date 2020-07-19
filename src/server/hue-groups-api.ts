import {Express, Request, Response} from 'express';
import {ErrorResponse} from '../response/error-response';
import {HueBuilder} from '../builder/hue-builder';
import {HueError} from '../error/hue-error';
import {HueServerCallback} from './hue-server-callback';

export class HueGroupsApi {

    constructor(private app: Express, private builder: HueBuilder, private callbacks: HueServerCallback) {
        // 2. Groups API
        if (this.callbacks.onGroups) {
            this.app.get('/api/:username/groups', this.onGroups);
        }
        if (this.callbacks.onCreateGroup) {
            this.app.post('/api/:username/groups', this.onCreateGroup);
        }
        if (this.callbacks.onGroupAttributes) {
            this.app.get('/api/:username/groups/:id', this.onGroupAttributes);
        }
    }

    private onGroups = (req: Request, res: Response) => {
        const username = req.params.username;
        this.builder.logger.debug(`HueServer: Incoming GET /api/${username}/groups request`);

        if (this.callbacks.onGroups) {
            this.callbacks.onGroups(req, username).subscribe(groups => {
                res.json(groups);
            }, (err: HueError) => {
                res.json(ErrorResponse.create(err, '/groups'));
            });
        } else {
            res.json({});
        }
    };

    private onCreateGroup = (req: Request, res: Response) => {
        const username = req.params.username;
        this.builder.logger.debug(`HueServer: Incoming POST /api/${username}/groups request`);

        if (this.callbacks.onCreateGroup) {
            this.callbacks.onCreateGroup(req, req.body).subscribe(id => {
                res.json([{
                    success: {
                        id: id
                    }
                }]);
            }, (err: HueError) => {
                res.json(ErrorResponse.create(err, '/groups'));
            });
        } else {
            res.json(ErrorResponse.create(HueError.GROUP_TABLE_FULL, `/groups`));
        }
    };

    private onGroupAttributes = (req: Request, res: Response) => {
        const username = req.params.username;
        const groupId = req.params.id;
        this.builder.logger.debug(`HueServer: Incoming GET /api/${username}/groups/${groupId} request`);

        if (this.callbacks.onGroupAttributes) {
            this.callbacks.onGroupAttributes(req, req.body).subscribe(group => {
                res.json(group);
            }, (err: HueError) => {
                res.json(ErrorResponse.create(err, '/groups'));
            });
        } else {
            res.json({});
        }
    };
}