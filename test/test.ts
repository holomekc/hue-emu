import {Observable, of, throwError} from 'rxjs';
import {HueBuilder} from '../src';
import {HueError} from '../src/error/hue-error';
import {PairingEvent} from '../src/events/pairing-event';
import {HueServer} from '../src/server/hue-server';
import {HueUpnp} from '../src/upnp/hue-upnp';
import * as uuid from 'uuid';
import {isUndefined} from '../src/util/utils';
import {devices} from './devices';

const extractArg = (index: number) => {
    return process.argv[index + 2].substr(process.argv[index + 2].indexOf('=') + 1);
};

const host: string = extractArg(0);
const port: number = parseInt(extractArg(1));
const udn: string = extractArg(2);

console.log(`host=${host}, port=${port}, udn=${udn}`);

const hueBuilder = HueBuilder.builder().withHost(host).withPort(port)
    .withDiscoveryHost(host).withDiscoveryPort(port).withUdn(udn);

const upnp = new HueUpnp(hueBuilder);
const server = new HueServer(hueBuilder, {
    onPairing(event: PairingEvent): Observable<string> {
        const pairingEnabled = true;

        if (pairingEnabled) {
            let username;
            if (isUndefined(event) || isUndefined(event.username) || event.username.length === 0) {
                username = uuid.v4();
                console.log('create random user id: ' + username);
            } else {
                username = event.username;
            }
            return of(username);
        } else {
            return throwError(HueError.LINK_BUTTON_NOT_PRESSED);
        }
    },
    onLights(username: string): Observable<any> {
        return of(devices);
    },
    onLight(username: string, lightId: string): Observable<any> {
        return of((devices as any)[lightId]);
    },
    onState(username: string, lightId: string, key: string, value: any): Observable<any> {
        (devices as any)[lightId].state[key] = value;
        return of((devices as any)[lightId]);
    }
});