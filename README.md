![Logo](resources/hue-emu-logo.png)

[![NPM version](http://img.shields.io/npm/v/hue-emu.svg)](https://www.npmjs.com/package/hue-emu)
[![Downloads](https://img.shields.io/npm/dm/hue-emu.svg)](https://www.npmjs.com/package/hue-emu)
[![Dependency Status](https://david-dm.org/holomekc/hue-emu.svg)](https://david-dm.org/holomekc/hue-emu)
[![Known Vulnerabilities](https://snyk.io/test/github/holomekc/hue-emu/badge.svg)](https://snyk.io/test/github/holomekc/hue-emu)

[![NPM](https://nodei.co/npm/hue-emu.png)](https://nodei.co/npm/hue-emu/)
# hue-emu
Allows to simulate a hue bridge

## Getting Started
The emulator does not force you to follow any structure regarding the data provided. It just helps you with the communication. Check out the examples to see how it works.

### Create builder

You need to create an instance of HueUpnp and HueServer. To do that you first need to create a HueBuilder.
* host: used by HueUpnp and HueServer
* port: used by HueServer
* discoveryHost: used by HueUpnp and HueServer. Name of the host the emulator will be discovered from other services
* discoveryPort: used by HueUpnp and HueServer. Port the emulator will be discovered from other services
* https: Configuration for https. Check util class for certificate generation
* udn: used by HueUpnp and HueSever. Unique uuid is fine
* mac: mac address. E.g. aa:aa:aa:aa:aa:aa
```typescript
const hueBuilder = HueBuilder.builder().withHost(host).withPort(port).withHttps(undefined)
    .withDiscoveryHost(host).withDiscoveryPort(port).withUdn(udn).withMac(mac).build();
```

### Create Server
```typescript
const upnp = new HueUpnp(hueBuilder);
const server = new HueServer(hueBuilder, {
    onPairing(req: Request, devicetype: string, generateclientkey?: boolean): Observable<string> {
        if (pairingEnabled) {
            // Do something awesome
            return of(username);
        } else {
            return throwError(HueError.LINK_BUTTON_NOT_PRESSED);
        }
    },
    onLights(req: Request, username: string): Observable<any> {
        // Return all lights
        return of({
           '1': {
           // ...
           }
        });
    },
    onLight(req: Request, username: string, lightId: string): Observable<any> {
        // Return a specific light
        return of({
           // ...
        });
    },
    onLightsState(req: Request, username: string, lightId: string, key: string, value: any): Observable<any> {
        // Change state.key of your fake light to the value specified 
        // Return the changed light (just for logging)
        return of({
           // ...
        });
    }
});
```

## Examples
You can find an example in test directory. Npm arguments must be set manually.