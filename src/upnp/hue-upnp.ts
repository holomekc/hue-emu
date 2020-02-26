import {createSocket, Socket} from 'dgram';
import {AddressInfo} from 'net';
import {AbstractHueServer} from '../abstract-hue-server';
import {HueBuilder} from '../builder/hue-builder';

/**
 * Responsible for handling upnp requests and answer them properly
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueUpnp extends AbstractHueServer {

    private static readonly UPNP_PORT = 1900;
    private static readonly MULTI_ADDR = '239.255.255.250';

    private readonly server: Socket;

    constructor(builder: HueBuilder) {
        super(builder);

        this.server = createSocket('udp4');

        this.server.on('error', this.onError);
        this.server.on('message', this.onMessage);
        this.server.on('listening', this.onListening);
        this.server.bind(HueUpnp.UPNP_PORT, this.host, () => {
            this.server.addMembership(HueUpnp.MULTI_ADDR);
        });
    }

    private onError = (err: Error) => {
        this.logger.error(`HueUpnp: Server error. Shutdown server:\n${err.stack}`);
        this.server.close();
    };

    private onMessage = (msg: Buffer, rinfo: AddressInfo) => {
        this.logger.fine(`HueUpnp: Server got request: ${msg} from ${rinfo.address}:${rinfo.port}`);

        if (msg !== null && typeof msg !== 'undefined' && msg.toString().startsWith('M-SEARCH')) {
            this.logger.debug(`HueUpnp: Server got M-SEARCH request: ${msg} from ${rinfo.address}:${rinfo.port}`);

            // TODO: Maybe set HOST header
            const content = `HTTP/1.1 200 OK\r\nCACHE-CONTROL: max-age=100\r\nEXT:\r\nLOCATION: http://${this.discoveryHost}:${this.discoveryPort}/api/discovery.xml\r\nSERVER: FreeRTOS/7.4.2 UPnP/1.0 IpBridge/1.10.0\r\nST: urn:schemas-upnp-org:device:basic:1\r\nUSN: uuid:${this.udn}::urn:Belkin:device:**\r\n\r\n`;

            const resMsg = Buffer.from(content);

            this.server.send(resMsg, 0, resMsg.length, rinfo.port, rinfo.address, (err) => {
                if (err) {
                    this.logger.error(`HueUpnp: Could not send M-SEARCH response.\n${err.stack}`);
                } else {
                    this.logger.debug(`HueUpnp: Send response to M-SEARCH request from ${rinfo.address}:${rinfo.port}`);
                }
            });
        }
    };

    private onListening = () => {
        const address = this.server.address() as AddressInfo;
        this.logger.debug(`HueUpnp: Server listening ${address.address}:${address.port}`);
    };
}