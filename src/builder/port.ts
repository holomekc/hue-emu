/**
 * Part of {@link HueBuilder} to make sure that required properties are set.
 * This is for port
 *
 * @author Christopher Holomek
 * @since 26.02.2020
 */
import { Https } from "./https";

export interface Port {
  /**
   * Set port
   * @param port
   */
  withPort(port: number): Https;
}
