/**
 * Part of {@link HueBuilder} to make sure that required properties are set.
 * This is for host
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
import {Port} from './port';

export interface Host {

    /**
     * Set host name
     * @param host name
     */
    withHost(host: string): Port;
}