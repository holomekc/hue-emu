import {ErrorResponse} from '../response/error-response';
import {HueBuilder} from '../builder/hue-builder';
import {HueError} from '../error/hue-error';
import {HueServerCallback} from './hue-server-callback';
import {HueS} from './lib/hue-s';
import {HueSRequest} from './lib/hue-s-request';
import {HueSResponse} from './lib/hue-s-response';

export class HueGroupsApi {

    constructor(private app: HueS, private builder: HueBuilder, private callbacks: HueServerCallback) {
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

    private onGroups = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;

        if (this.callbacks.onGroups) {
            this.callbacks.onGroups(req, username).subscribe(groups => {
                res.json(groups);
            }, (err: HueError) => {
                res.json([ErrorResponse.create(err, '/groups')]);
            });
        } else {
            res.json({});
        }
    };

    private onCreateGroup = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;

        if (this.callbacks.onCreateGroup) {
            this.callbacks.onCreateGroup(req, username).subscribe(id => {
                res.json([{
                    success: {
                        id: id
                    }
                }]);
            }, (err: HueError) => {
                res.json([ErrorResponse.create(err, '/groups')]);
            });
        } else {
            res.json([ErrorResponse.create(HueError.GROUP_TABLE_FULL, `/groups`)]);
        }
    };

    private onGroupAttributes = (req: HueSRequest, res: HueSResponse) => {
        const username = req.params.username;
        const groupId = req.params.id;

        if (this.callbacks.onGroupAttributes) {
            this.callbacks.onGroupAttributes(req, username, groupId).subscribe(group => {
                res.json(group);
            }, (err: HueError) => {
                res.json([ErrorResponse.create(err, '/groups')]);
            });
        } else {
            res.json({});
        }
    };
}