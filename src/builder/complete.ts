import {HueBuilder} from './hue-builder';

export interface Complete {
    /**
     * Complete builder
     */
    build(): HueBuilder;
}