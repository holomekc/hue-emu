![Logo](resources/hue-emu-logo.jpg)

[![NPM version](http://img.shields.io/npm/v/hue-emu.svg)](https://www.npmjs.com/package/hue-emu)
[![Downloads](https://img.shields.io/npm/dm/hue-emu.svg)](https://www.npmjs.com/package/hue-emu)
[![Dependency Status](https://david-dm.org/holomekc/hue-emu.svg)](https://david-dm.org/holomekc/hue-emu)
[![Known Vulnerabilities](https://snyk.io/test/github/holomekc/hue-emu/badge.svg)](https://snyk.io/test/github/holomekc/hue-emu)

[![NPM](https://nodei.co/npm/hue-emu.png)](https://nodei.co/npm/hue-emu/)
# hue-emu
Allows to simulate a hue bridge

## Getting started

You need to create an instance of HueUpnp and HueServer. To do that you first need to create a HueBuilder.
* host: used by HueUpnp and HueServer
* port: used by 
```typescript
const hueBuilder = HueBuilder.builder().withHost(host).withPort(port)
    .withDiscoveryHost(host).withDiscoveryPort(port).withUdn(udn);
```