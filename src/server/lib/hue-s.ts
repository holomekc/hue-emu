import {HueBuilder} from '../../builder/hue-builder';
import {HueSRequest} from './hue-s-request';
import {HueSResponse} from './hue-s-response';

export abstract class HueS {

    protected constructor(protected builder: HueBuilder) {
    }

    abstract setDefaultResponseHeaders(param: { [key: string]: string }): void;

    abstract registerOnRequest(callback: (req: HueSRequest) => void): void;

    abstract get(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    abstract post(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    abstract put(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    abstract delete(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    abstract startServer(onReady: () => void): void;
}