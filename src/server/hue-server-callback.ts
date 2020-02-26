import {Observable} from 'rxjs';
import {PairingEvent} from '../events/pairing-event';

export interface HueServerCallback {
    onPairing(event: PairingEvent): Observable<string>;
    onLights(username: string): Observable<any>;
    onLight(username: string, lightId: string): Observable<any>;
    onState(username: string, lightId: string, key: string, value: any): Observable<any>;
}