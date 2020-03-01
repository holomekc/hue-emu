import {Request, Response} from 'express';
import {Observable} from 'rxjs';

export interface HueServerCallback {

    // 1. Lights API
    onLights?(req: Request, username: string): Observable<any>;
    onLightsNew?(req: Request, username: string): Observable<any>;
    onLightsSearchNew?(req: Request, username: string, deviceId?: string[]): Observable<void>;
    onLight?(req: Request, username: string, lightId: string): Observable<any>;
    onLightsRename?(req: Request, username: string, lightId: string, name: string): Observable<any>;
    onLightsState?(req: Request, username: string, lightId: string, key: string, value: any): Observable<any>;
    onLightsDelete?(req: Request, username: string, lightId: string): Observable<any>;

    // 2. Groups API
    onGroups?(req: Request, username: string): Observable<any>;
    onCreateGroup?(req: Request, username: string): Observable<any>;
    onGroupAttributes?(req: Request, content: any): Observable<any>;

    // 3. Schedules API

    // 4. Scenes API

    // 6. Sensors API

    // 7. Configuration API
    onPairing?(req: Request, devicetype: string, generateclientkey?: boolean): Observable<string>;
    onAll?(req: Request, username: string): Observable<any>;
    onConfig?(req: Request): Observable<any>;

    // 8. Info API (deprecated as of 1.15)

    // 9. Resourcelinks API

    // 10. Capabilities API

    // Fallback
    onFallback?(req: Request, res: Response): Observable<any>;
}