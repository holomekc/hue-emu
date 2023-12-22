import {Observable, of, throwError} from 'rxjs';
import {HueSRequest} from '../dist/server/lib/hue-s-request';
import {HueBuilder} from '../src';
import {HueError} from '../src/error/hue-error';
import {HueServer} from '../src/server/hue-server';
import {HueUpnp} from '../src/upnp/hue-upnp';
import * as uuid from 'uuid';
import {generateCertificate} from '../src/util/utils';
import {devices} from './devices';
import * as readline from 'readline';

const extractArg = (index: number) => {
    return process.argv[index + 2].substr(process.argv[index + 2].indexOf('=') + 1);
};

const host: string = extractArg(0);
const port: number = parseInt(extractArg(1));
const udn: string = extractArg(2);
const mac: string = extractArg(3);
const ip: string = extractArg(4);


console.log(`host=${host}, port=${port}, udn=${udn}`);

let certificateDefinition = generateCertificate();

console.log(certificateDefinition.private);

console.log();

console.log(certificateDefinition.cert);

const hueBuilder = HueBuilder.builder().withHost(host).withPort(port).withHttps({
    port: 443,
    cert: certificateDefinition.cert,
    key: certificateDefinition.private
})
    .withDiscoveryHost(host).withDiscoveryPort(port).withUdn(udn).withMac(mac);

let user = '';

const authUsers:any = {
    'test': 'just testing',
    '39c29d14-0d0d-426a-815d-793810d6de53': 'Harmony Hub'
};

let pairingEnabled = false;

let upnp = new HueUpnp(hueBuilder);
upnp.stop().subscribe(() => {
    upnp = new HueUpnp(hueBuilder);
});
const server = new HueServer(hueBuilder, {
    onFallback(): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('0'));
    },
    onLightsDelete(): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('1'));
    }, onLightsNew(): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('2'));
    }, onLightsRename(): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('3'));
    }, onLightsSearchNew(): Observable<void> {
        return throwError(HueError.INTERNAL_ERROR.withParams('4'));
    },
    onAll(): Observable<any> {
        const result: any = {};

        result['lights'] = JSON.parse(JSON.stringify(devices));
        result['groups'] = {};
        result['config'] = {
            name: 'Philips hue',
            datastoreversion: '90',
            swversion: '1941132080',
            apiversion: '1.41.0',
            mac: mac, // May be checked by some clients. May also be valid value.
            bridgeid: hueBuilder.bridgeId,
            factorynew: false,
            replacesbridgeid: null,
            modelid: 'BSB002',
            starterkitid: '',
            ipaddress: ip // May be checked by some clients. May also be a valid value
        };
        result['schedules'] = {};
        result['scenes'] = {};
        result['rules'] = {};
        result['sensors'] = {};
        result['resourcelinks'] = {};

        return of(result);
    },
    onPairing(req: HueSRequest, devicetype: string): Observable<string> {
        if (pairingEnabled) {
            let username;
            username = uuid.v4();
            console.log('handle random user id: ' + username + ' and deviceType: ' + devicetype);
            user = username;
            if (devicetype) {
                authUsers[username] = devicetype;
            } else {
                authUsers[username] = "moos";
            }
            // pairingEnabled = false;
            return of(username);
        } else {
            return throwError(HueError.LINK_BUTTON_NOT_PRESSED);
        }
    },
    onLights(req: HueSRequest, username: string): Observable<any> {
        if (authUsers[username]) {
            return of(devices);
        } else {
            if (pairingEnabled) {
                console.log('Not authorized but in pairing add user from request: ' + username);
                authUsers[username] = "Echo";
                return of(devices);
            }
            console.log('Not authorized. Failure');
            return throwError(HueError.UNAUTHORIZED_USER);
        }
    },
    onLight(req: HueSRequest, username: string, lightId: string): Observable<any> {
        if (authUsers[username]) {
            return of((devices as any)[lightId]);
        } else {
            if (pairingEnabled) {
                console.log('Not authorized but in pairing add user from request: ' + username);
                authUsers[username] = "Echo";
                return of((devices as any)[lightId]);
            }
            console.log('Not authorized. Failure');
            return throwError(HueError.UNAUTHORIZED_USER);
        }
    },
    onLightsState(req: HueSRequest, username: string, lightId: string, key: string, value: any): Observable<any> {
        if (authUsers[username]) {
            (devices as any)[lightId].state[key] = value;
            return of((devices as any)[lightId]);
        } else {
            return throwError(HueError.UNAUTHORIZED_USER);
        }
        // return throwError(HueError.RESOURCE_NOT_AVAILABLE.withParams(lightId));
    },
    onConfig(): Observable<any> {
        return of({
            name: 'Philips hue',
            datastoreversion: '90',
            swversion: '1941132080',
            apiversion: '1.41.0',
            mac: mac, // May be checked by some clients. May also be valid value.
            bridgeid: hueBuilder.bridgeId,
            factorynew: false,
            replacesbridgeid: null,
            modelid: 'BSB002',
            starterkitid: ''
        });
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pairLoop = () => {
    rl.question('pair?', () => {
        console.log('start pairing');
        pairingEnabled = true;
        setTimeout(() => {
            pairingEnabled = false;
            console.log('stop pairing');
            pairLoop();
        }, 20000)
    });
};
pairLoop();
