import {createSocket, Socket} from 'dgram';
import {AddressInfo} from 'net';
import {HueBuilder} from '../builder/hue-builder';
import mdns from 'mdns';
import {ServiceType} from 'mdns';

/**
 * Responsible for handling upnp requests and answer them properly
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueUpnp {

    private static readonly UPNP_PORT = 1900;
    private static readonly MULTI_ADDR = '239.255.255.250';

    private readonly server: Socket;
    private readonly upnpPort: number;
    private readonly shortMac: string;

    constructor(private builder: HueBuilder) {
        this.upnpPort = builder.upnpPort;
        if (this.upnpPort === null || typeof this.upnpPort === 'undefined') {
            this.upnpPort = HueUpnp.UPNP_PORT;
        }
        this.server = createSocket('udp4');

        this.server.on('error', this.onError);
        this.server.on('message', this.onMessage);
        this.server.on('listening', this.onListening);
        this.server.bind(this.getPort(), this.builder.host, () => {
            this.server.addMembership(HueUpnp.MULTI_ADDR, this.builder.host);
        });

        this.shortMac = builder.mac.replace(/:/g,'');
        const mdnsMac = this.shortMac.substring(this.shortMac.length - 6, this.shortMac.length);


        let message = `NOTIFY * HTTP/1.1\r\nHOST: ${HueUpnp.MULTI_ADDR}:${this.upnpPort}\r\nCACHE-CONTROL: max-age=100\r\nLOCATION: http://${builder.discoveryHost}:${builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nGWID.phoscon.de: ${this.shortMac}\r\nhue-bridgeid: ${this.shortMac}\r\nNTS: ssdp:alive\r\nNT: upnp:rootdevice\r\nUSN: uuid:${this.builder.udn}::upnp:rootdevice\r\n\r\n`;
        const resMsg = Buffer.from(message);

        message = `NOTIFY * HTTP/1.1\r\nHOST: ${HueUpnp.MULTI_ADDR}:${this.upnpPort}\r\nCACHE-CONTROL: max-age=100\r\nLOCATION: http://${builder.discoveryHost}:${builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nGWID.phoscon.de: ${this.shortMac}\r\nhue-bridgeid: ${this.shortMac}\r\nNTS: ssdp:alive\r\nNT: uuid:${this.builder.udn}\r\nUSN: uuid:${this.builder.udn}\r\n\r\n`;
        const resMsg2 = Buffer.from(message);

        message = `NOTIFY * HTTP/1.1\r\nHOST: ${HueUpnp.MULTI_ADDR}:${this.upnpPort}\r\nCACHE-CONTROL: max-age=100\r\nLOCATION: http://${builder.discoveryHost}:${builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nGWID.phoscon.de: ${this.shortMac}\r\nhue-bridgeid: ${this.shortMac}\r\nNTS: ssdp:alive\r\nNT: urn:schemas-upnp-org:device:basic:1\r\nUSN: uuid:${this.builder.udn}::urn:schemas-upnp-org:device:basic:1\r\n\r\n`;
        const resMsg3 = Buffer.from(message);

        setInterval(() => {
            this.server.send(resMsg,0, resMsg.length, 1900, HueUpnp.MULTI_ADDR);
            this.server.send(resMsg2, 0,resMsg2.length, 1900, HueUpnp.MULTI_ADDR);
            this.server.send(resMsg3, 0,resMsg3.length, 1900, HueUpnp.MULTI_ADDR);
        }, 3000);

        // Philips Hue - xxxxxx._hue._tcp._local
        // protocol: tcp
        // service: hue
        // name: Philips Hue - xxxxxx where xxxxxx are the last 6 digits of the bridge ID.

        const txtRecord = {
            bridgeid: this.shortMac,
            modelid: 'BSB002'
        };

        // const hue = new mdns.ServiceType('hue', 'tcp');
        const hue = new ServiceType({
            name: 'hue',
            protocol: 'tcp'
        })

        const ad = mdns.createAdvertisement(hue, 4321, {
            domain: '${mdnsMac}._hue._tcp.local.',
            name: `Philips Hue - ${mdnsMac}`,
            host: this.builder.discoveryHost,
            txtRecord: txtRecord,
            context: ''
        }, (err, service) => {
            if(err) this.builder.logger.error(err);
        });
        ad.start();

        const browser = mdns.createBrowser(mdns.tcp('http'));
        browser.on('serviceUp', service => {
            console.log("service up: ", service);
        });
        browser.on('serviceDown', service => {
            console.log("service down: ", service);
        });
        browser.start();
    }

    private getPort(): number {
        return this.upnpPort;
    }

    private onError = (err: Error) => {
        this.builder.logger.error(`HueUpnp: Server error. Shutdown server:\n${err.stack}`);
        this.server.close();
    };

    private onMessage = (msg: Buffer, rinfo: AddressInfo) => {
        //this.builder.logger.fine(`HueUpnp: Server got request: ${msg} from ${rinfo.address}:${rinfo.port}\n`);

        if (msg !== null && typeof msg !== 'undefined') {
            const message = msg.toString();

            if(message.startsWith('M-SEARCH *')) {
                this.builder.logger.debug(`HueUpnp: Server got M-SEARCH request: ${msg} from ${rinfo.address}:${rinfo.port}\n`);

                // Deconz:
                // ssdp:all
                // upnp:rootdevice
                // ST: uuid:{gwConfig[uuid]}
                // urn:schemas-upnp-org:device:basic:1

                // TODO: Maybe set HOST header
                //const content = `HTTP/1.1 200 OK\r\nCACHE-CONTROL: max-age=100\r\nEXT:\r\nLOCATION: http://${this.builder.discoveryHost}:${this.builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nST: urn:schemas-upnp-org:device:basic:1\r\nUSN: uuid:${this.builder.udn}::urn:Belkin:device:**\r\n\r\n`;

                const content = `HTTP/1.1 200 OK\r\nCACHE-CONTROL: max-age=100\r\nEXT:\r\nLOCATION: http://${this.builder.discoveryHost}:${this.builder.discoveryPort}/description.xml\r\nSERVER: Linux/3.14.0 UPnP/1.0 IpBridge/1.26.0\r\nGWID.phoscon.de: ${this.shortMac}\r\nhue-bridgeid: ${this.shortMac}\r\n`

                if(message.includes('ssdp:all') || message.includes('upnp:rootdevice')) {
                    this.builder.logger.debug('HueUpnp: answer with rootdevice');
                    let response = content + `ST: upnp:rootdevice\r\nUSN: uuid:${this.builder.udn}::upnp:rootdevice\r\n\r\n`;
                    this.sendMessage(response, rinfo);
                }
                if(message.includes('ssdp:all') || message.includes(`ST: uuid:${this.shortMac}`)) {
                    this.builder.logger.debug('HueUpnp: answer with uuid');
                    let response = content + `ST: uuid:${this.builder.udn}\r\nUSN: uuid:${this.builder.udn}\r\n\r\n`;
                    this.sendMessage(response, rinfo);
                }
                if(message.includes('ssdp:all') || message.includes('urn:schemas-upnp-org:device:basic:1')) {
                    this.builder.logger.debug('HueUpnp: answer with basic');
                    let response = content + `ST: urn:schemas-upnp-org:device:basic:1\r\nUSN: uuid:${this.builder.udn}::urn:schemas-upnp-org:device:basic:1\r\n\r\n`;
                    this.sendMessage(response, rinfo);
                }
            }

        }
    };

    private sendMessage(response: string, rinfo: AddressInfo) {
        const resMsg = Buffer.from(response);
        this.server.send(resMsg, 0, resMsg.length, rinfo.port, rinfo.address, (err) => {
            if (err) {
                this.builder.logger.error(`HueUpnp: Could not send M-SEARCH response.\n${err.stack}`);
            } else {
                this.builder.logger.debug(`HueUpnp: Send response to M-SEARCH request from ${rinfo.address}:${rinfo.port}`);
            }
        });
    }

    private onListening = () => {
        const address = this.server.address() as AddressInfo;
        this.builder.logger.debug(`HueUpnp: Server listening ${address.address}:${address.port}`);
    };
}