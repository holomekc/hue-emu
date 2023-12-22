import { HueBuilder } from "../../../builder/hue-builder";
import { HueServerCallbacks } from "../../hue-server-callbacks";
import { HueS } from "../../lib/hue-s";
import { HueLightsApi } from "./hue-lights-api";
import { HueGroupsApi } from "./hue-groups-api";
import { HueConfigurationApi } from "./hue-configuration-api";
import { HueSchedulesApi } from "./hue-schedules-api";
import { HueScenesApi } from "./hue-scenes-api";
import { HueSensorsApi } from "./hue-sensors-api";
import { HueInfoApi } from "./hue-info-api";
import { HueResourcelinksApi } from "./hue-resourcelinks-api";
import { HueCapabilitiesApi } from "./hue-capabilities-api";

export class HueApiV1Handler {
  constructor(
    private app: HueS,
    private builder: HueBuilder,
    private callbacks: HueServerCallbacks
  ) {
    // 1. Lights API
    new HueLightsApi(this.app, this.builder, this.callbacks);

    // 2. Groups API
    new HueGroupsApi(this.app, this.builder, this.callbacks);

    // 3. Schedules API
    new HueSchedulesApi(this.app, this.builder, this.callbacks);

    // 4. Scenes API
    new HueScenesApi(this.app, this.builder, this.callbacks);

    // 6. Sensors API
    new HueSensorsApi(this.app, this.builder, this.callbacks);

    // 7. Configuration API
    new HueConfigurationApi(this.app, this.builder, this.callbacks);

    // 8. Info API (deprecated as of 1.15)
    new HueInfoApi(this.app, this.builder, this.callbacks);

    // 9. Resourcelinks API
    new HueResourcelinksApi(this.app, this.builder, this.callbacks);

    // 10. Capabilities API
    new HueCapabilitiesApi(this.app, this.builder, this.callbacks);
  }
}
