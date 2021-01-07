import {Observable} from 'rxjs';
import {HueSRequest} from './lib/hue-s-request';
import {HueSResponse} from './lib/hue-s-response';

export interface HueServerCallback {

    // 1. Lights API
    onLights?(req: HueSRequest, username: string): Observable<any>;
    onLightsNew?(req: HueSRequest, username: string): Observable<any>;
    onLightsSearchNew?(req: HueSRequest, username: string, deviceId?: string[]): Observable<void>;
    onLight?(req: HueSRequest, username: string, lightId: string): Observable<any>;
    onLightsRename?(req: HueSRequest, username: string, lightId: string, name: string): Observable<any>;
    onLightsState?(req: HueSRequest, username: string, lightId: string, key: string, value: any): Observable<any>;
    onLightsDelete?(req: HueSRequest, username: string, lightId: string): Observable<any>;

    // 2. Groups API
    onGroups?(req: HueSRequest, username: string): Observable<any>;
    onCreateGroup?(req: HueSRequest, username: string): Observable<any>;
    onGroupAttributes?(req: HueSRequest, username: string, groupId: string): Observable<any>;

    // 3. Schedules API

    // 4. Scenes API

    // 6. Sensors API

    // 7. Configuration API
    onPairing?(req: HueSRequest, devicetype: string, generateclientkey?: boolean): Observable<string>;
    onAll?(req: HueSRequest, username: string): Observable<any>;
    onConfig?(req: HueSRequest): Observable<any>;

    // 8. Info API (deprecated as of 1.15)

    // 9. Resourcelinks API

    // 10. Capabilities API

    // Fallback
    onFallback?(req: HueSRequest, res: HueSResponse): Observable<any>;
}