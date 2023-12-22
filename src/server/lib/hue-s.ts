import {HueBuilder} from '../../builder/hue-builder';
import {HueSRequest} from './hue-s-request';
import {HueSResponse} from './hue-s-response';

export abstract class HueS {

    protected constructor(protected builder: HueBuilder) {
    }

    /**
     * Set headers used for every response
     * @param param headers to set
     */
    abstract setDefaultResponseHeaders(param: { [key: string]: string }): void;

    /**
     * Register hook for incoming requests
     * @param callback callback function to call
     */
    abstract registerOnRequest(callback: (req: HueSRequest) => void): void;

    /**
     * Register hook for outgoing responses
     * @param callback callback function to call
     */
    abstract registerOnResponse(callback: (payload: any, headers: any) => void): void;

    /**
     * Register HTTP GET call
     * @param path url path to register
     * @param callback callback function to call
     */
    abstract get(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    /**
     * Register HTTP POST call
     * @param path url path to register
     * @param callback callback function to call
     */
    abstract post(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    /**
     * Register HTTP PUT call
     * @param path url path to register
     * @param callback callback function to call
     */
    abstract put(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    /**
     * Register HTTP DELETE call
     * @param path url path to register
     * @param callback callback function to call
     */
    abstract delete(path: string, callback: (req: HueSRequest, res: HueSResponse) => void): void;

    /**
     * Start server
     * @param onReady callback to call when server is ready
     */
    abstract startServer(onReady: () => void): void;
}