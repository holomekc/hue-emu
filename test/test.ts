import {Observable, of, throwError} from 'rxjs';
import {HueBuilder} from '../src';
import {HueError} from '../src/error/hue-error';
import {HueServer} from '../src/server/hue-server';
import {HueUpnp} from '../src/upnp/hue-upnp';
import {Request, Response} from 'express';
import * as uuid from 'uuid';
import {generateCertificate, isUndefined} from '../src/util/utils';
import {devices} from './devices';

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

console.log(certificateDefinition.cert);

const hueBuilder = HueBuilder.builder().withHost(host).withPort(port).withHttps({
    port: 443,
    cert: certificateDefinition.cert,
    key: certificateDefinition.private
})
    .withDiscoveryHost(host).withDiscoveryPort(port).withUdn(udn);

let user = '';

const hueBuilder2 = HueBuilder.builder().withHost(host).withPort(port).withHttps(undefined)
    .withDiscoveryHost(host).withDiscoveryPort(port).withUdn(udn).withLogger({
        debug(message?: any, ...optionalParams: any[]): void {
        }, error(message?: any, ...optionalParams: any[]): void {
        }, fine(message?: any, ...optionalParams: any[]): void {
        }, info(message?: any, ...optionalParams: any[]): void {
        }, warn(message?: any, ...optionalParams: any[]): void {
        }
    });

const upnp = new HueUpnp(hueBuilder2);
const server = new HueServer(hueBuilder, {
    onFallback(req: Request, res: Response): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('0'));
    },
    onLightsDelete(username: string, lightId: string): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('1'));
    }, onLightsNew(username: string): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('2'));
    }, onLightsRename(username: string, lightId: string, name: string): Observable<any> {
        return throwError(HueError.INTERNAL_ERROR.withParams('3'));
    }, onLightsSearchNew(username: string, deviceId: string[] | undefined): Observable<void> {
        return throwError(HueError.INTERNAL_ERROR.withParams('4'));
    },
    onAll(username: string): Observable<any> {
        const result: any = {};

        result['lights'] = JSON.parse(JSON.stringify(devices));
        result['groups'] = {};
        result['config'] = {
            name: 'Philips hue',
            datastoreversion: '90',
            swversion: '1937045000',
            apiversion: '1.36.0',
            mac: mac, // May be checked by some clients. May also be valid value.
            bridgeid: '1111111111111111',
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
    onPairing(devicetype: string, generateclientkey?: boolean): Observable<string> {
        const pairingEnabled = true;

        if (pairingEnabled) {
            let username;
            username = uuid.v4();
            console.log('create random user id: ' + username);
            user = username;
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
    onLightsState(username: string, lightId: string, key: string, value: any): Observable<any> {
        (devices as any)[lightId].state[key] = value;
        return of((devices as any)[lightId]);
        // return throwError(HueError.RESOURCE_NOT_AVAILABLE.withParams(lightId));
    },
    onConfig(): Observable<any> {
        return of({
            name: 'Philips hue',
            datastoreversion: '90',
            swversion: '1937045000',
            apiversion: '1.36.0',
            mac: mac, // May be checked by some clients. May also be valid value.
            bridgeid: '1111111111111111',
            factorynew: false,
            replacesbridgeid: null,
            modelid: 'BSB002',
            starterkitid: ''
        });
    }
});