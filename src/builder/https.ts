/**
 * Part of {@link HueBuilder} to make sure that required properties are set.
 * This is for https configuration
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
import {DiscoveryHost} from './discovery-host';
import {HttpsConfig} from './https-config';

export interface Https {

    /**
     * Set all configuration which is necessary for https
     * @param  https configuration
     */
    withHttps(https: HttpsConfig | undefined): DiscoveryHost;
}