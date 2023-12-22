import { HueBuilder } from "./hue-builder";

export interface Mac {
  /**
   * Set mac
   * @param mac
   */
  withMac(mac: string): HueBuilder;
}
