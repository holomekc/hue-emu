import {DefaultLogger, Logger} from '../logger';
import {DiscoveryHost} from './discovery-host';
import {DiscoveryPort} from './discovery-port';
import {Host} from './host';
import {Port} from './port';
import {Udn} from './udn';

/**
 * Builder for {@link HueBuilder}
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export class HueBuilder implements Host, Port, DiscoveryHost, DiscoveryPort, Udn{

    private _host: string = undefined as unknown as string;
    private _port: number = undefined as unknown as number;
    private _discoveryHost: string = undefined as unknown as string;
    private _discoveryPort: number = undefined as unknown as number;
    private _udn: string = undefined as unknown as string;
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

    withPort(port: number): DiscoveryHost {
        this._port = port;
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

    withUdn(udn: string): HueBuilder {
        this._udn = udn;
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
     * Get logger
     */
    get logger(): Logger {
        return this._logger;
    }
}