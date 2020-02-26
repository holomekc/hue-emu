/**
 * Part of {@link HueBuilder} to make sure that required properties are set.
 * This is for udn
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
import {HueBuilder} from './hue-builder';

export interface Udn {

    /**
     * Set udn
     * @param udn
     */
    withUdn(udn: string): HueBuilder;
}