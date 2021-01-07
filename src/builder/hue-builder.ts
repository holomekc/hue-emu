import {DefaultLogger, Logger} from '../logger';
import {DiscoveryHost} from './discovery-host';
import {DiscoveryPort} from './discovery-port';
import {Host} from './host';
import {Https} from './https';
import {HttpsConfig} from './https-config';
import {Mac} from './mac';
import {Port} from './port';
import {Udn} from './udn';

/**
 * Builder for {@link HueBuilder}
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueBuilder implements Host, Port, Https, DiscoveryHost, DiscoveryPort, Udn, Mac {

    private _host: string = undefined as unknown as string;
    private _port: number = undefined as unknown as number;
    private _httpsConfig: HttpsConfig | undefined = undefined;
    private _discoveryHost: string = undefined as unknown as string;
    private _discoveryPort: number = undefined as unknown as number;
    private _udn: string = undefined as unknown as string;
    private _upnpPort: number = undefined as unknown as number;
    private _mac: string = undefined as unknown as string;
    private _shortMac: string = undefined as unknown as string;
    private _bridgeId: string = undefined as unknown as string;
    private _logger: Logger = new DefaultLogger();

    /**
     * Hide constructor
     */
    constructor() {
        // Hide constructor
    }

    /**
     * Create a new instance of a builder
     */
    public static builder(): Host {
        return new HueBuilder();
    }

    withHost(host: string): Port {
        this._host = host;
        return this;
    }

    withPort(port: number): Https {
        this._port = port;
        return this;
    }

    withHttps(httpsConfig: HttpsConfig | undefined): DiscoveryHost {
        this._httpsConfig = httpsConfig;
        return this;
    }

    withDiscoveryHost(host: string): DiscoveryPort {
        this._discoveryHost = host;
        return this;
    }

    withDiscoveryPort(port: number): Udn {
        this._discoveryPort = port;
        return this;
    }

    withUdn(udn: string): Mac {
        this._udn = udn;
        return this;
    }

    withMac(mac: string): HueBuilder {
        this._mac = mac;
        if (this.mac) {
            this._shortMac = this.mac.replace(/:/g, '');
            this._bridgeId = (this._shortMac.substring(0, 6) + 'FFFF' + this._shortMac.substring(6, this._shortMac.length)).toUpperCase();
        }
        return this;
    }

    withUpnpPort(upnpPort: number): HueBuilder {
        this._upnpPort = upnpPort;
        return this;
    }

    /**
     * Set logger to use
     * @param logger
     *        logger to use
     */
    public withLogger(logger: Logger): HueBuilder {
        this._logger = logger;
        return this;
    }

    /**
     * Get host name
     */
    get host(): string {
        return this._host;
    }

    /**
     * Get port
     */
    get port(): number {
        return this._port;
    }

    /**
     * Get https configuration
     */
    get httpsConfig(): HttpsConfig | undefined {
        return this._httpsConfig;
    }

    /**
     * Get discovery host
     */
    get discoveryHost(): string {
        return this._discoveryHost;
    }

    /**
     * Get discovery port
     */
    get discoveryPort(): number {
        return this._discoveryPort;
    }

    /**
     * Get udn
     */
    get udn(): string {
        return this._udn;
    }

    /**
     * Get upnp port
     */
    get upnpPort(): number {
        return this._upnpPort;
    }

    /**
     * Get mac address
     */
    get mac(): string {
        return this._mac;
    }


    /**
     * Get short mac address. Without ':'
     */
    get shortMac(): string {
        return this._shortMac;
    }

    /**
     * Get bridgeId based on shortMac + 'FFFF' in the middle.
     */
    get bridgeId(): string {
        return this._bridgeId;
    }

    /**
     * Get logger
     */
    get logger(): Logger {
        return this._logger;
    }
}