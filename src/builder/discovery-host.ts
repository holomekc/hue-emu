/**
 * Part of {@link HueBuilder} to make sure that required properties are set.
 * This is for host
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
import {DiscoveryPort} from './discovery-port';

export interface DiscoveryHost {

    /**
     * Set host name
     * @param host name
     */
    withDiscoveryHost(host: string): DiscoveryPort;
}