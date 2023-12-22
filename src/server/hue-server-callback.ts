import {Request, Response} from 'express';
import {Observable} from 'rxjs';

export interface HueServerCallback {

    // 1. Lights API
    onLights?(username: string): Observable<any>;
    onLightsNew?(username: string): Observable<any>;
    onLightsSearchNew?(username: string, deviceId?: string[]): Observable<void>;
    onLight?(username: string, lightId: string): Observable<any>;
    onLightsRename?(username: string, lightId: string, name: string): Observable<any>;
    onLightsState?(username: string, lightId: string, key: string, value: any): Observable<any>;
    onLightsDelete?(username: string, lightId: string): Observable<any>;

    // 2. Groups API
    onGroups?(username: string): Observable<any>;
    onCreateGroup?(username: string): Observable<any>;
    onGroupAttributes?(content: any): Observable<any>;

    // 3. Schedules API

    // 4. Scenes API

    // 6. Sensors API

    // 7. Configuration API
    onPairing?(devicetype: string, generateclientkey?: boolean): Observable<string>;
    onAll?(username: string): Observable<any>;
    onConfig?(): Observable<any>;

    // 8. Info API (deprecated as of 1.15)

    // 9. Resourcelinks API

    // 10. Capabilities API

    // Fallback
    onFallback?(req: Request, res: Response): Observable<any>;
}