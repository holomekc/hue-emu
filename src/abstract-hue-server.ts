import {HueBuilder} from './builder/hue-builder';
import {Logger} from './logger';

/**
 * Abstract class for hue servers it contains all necessary configuration and also provides the logger
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
export abstract class AbstractHueServer {
    protected readonly logger: Logger;

    protected readonly host: string;
    protected readonly port: number;
    protected readonly discoveryHost: string;
    protected readonly discoveryPort: number;

    protected readonly udn: string;

    protected constructor(builder: HueBuilder) {
        this.logger = builder.logger;

        this.host = builder.host;
        this.port = builder.port;
        this.discoveryHost = builder.discoveryHost;
        this.discoveryPort = builder.discoveryPort;
        this.udn = builder.udn;
    }
}