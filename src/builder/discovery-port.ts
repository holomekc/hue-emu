/**
 * Part of {@link HueBuilder} to make sure that required properties are set.
 * This is for port
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
import {Udn} from './udn';

export interface DiscoveryPort {

    /**
     * Set port
     * @param port
     */
    withDiscoveryPort(port: number): Udn;
}