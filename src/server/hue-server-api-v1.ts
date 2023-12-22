import { Observable } from "rxjs";
import { HueSRequest } from "./lib/hue-s-request";
import { HueSResponse } from "./lib/hue-s-response";

export interface HueServerApiV1 {
  // 1. Lights API
  getAllLights?(req: HueSRequest, username: string): Observable<any>;
  getNewLights?(req: HueSRequest, username: string): Observable<any>;
  searchForNewLights?(req: HueSRequest, username: string, deviceId?: string[]): Observable<void>;
  getLightAttributeAndState?(req: HueSRequest, username: string, lightId: string): Observable<any>;
  setLightAttributes?(req: HueSRequest, username: string, lightId: string, name: string): Observable<any>;
  setLightState?(req: HueSRequest, username: string, lightId: string, states: {[key: string]: any}):
    {[key: string]: Observable<any>};
  deleteLights?(req: HueSRequest, username: string, lightId: string): Observable<any>;

  // 2. Groups API
  getAllGroups?(req: HueSRequest, username: string): Observable<any>;
  createGroup?(req: HueSRequest, username: string, body: any): Observable<any>;
  getGroupAttributes?(req: HueSRequest, username: string, groupId: string): Observable<any>;
  setGroupAttributes?(req: HueSRequest, username: string, groupId: string,
                      groupName?: string, lights?: string[], class_?: string): Observable<any>;

  /**
   * https://developers.meethue.com/develop/hue-api/groupds-api/#set-gr-state
   * @param req
   *        HueEmu request
   * @param username
   *        api username
   * @param groupId
   *        group identifier
   * @param states
   *        a map of states to set
   */
  setGroupState?(req: HueSRequest, username: string, groupId: string, states: {[key: string]: any}):
    {[key: string]: Observable<any>};
  deleteGroup?(req: HueSRequest, username: string, groupId: string): Observable<any>;

  // 3. Schedules API
  getAllSchedules?(req: HueSRequest, username: string): Observable<any>;
  createSchedule?(req: HueSRequest, username: string, body: any): Observable<any>;
  getScheduleAttributes?(req: HueSRequest, username: string, scheduleId: string): Observable<any>;
  setScheduleAttributes?(req: HueSRequest, username: string, scheduleId: string,
                         scheduleName?: string, description?: string, command?: any,
                         time?: string, localtime?: string,
                         status?: string, autoDelete?: boolean): Observable<any>;
  deleteSchedule?(req: HueSRequest, username: string, scheduleId: string): Observable<any>;

  // 4. Scenes API
  getAllScenes?(req: HueSRequest, username: string): Observable<any>;
  createScene?(req: HueSRequest, username: string, body: any): Observable<any>;
  getScene?(req: HueSRequest, username: string, sceneId: string): Observable<any>;
  modifyScene?(req: HueSRequest, username: string, sceneId: string, body: any): Observable<any>;
  modifySceneLightStates?(req: HueSRequest, username: string, sceneId: string, lightStatesId: string,
                          body: any): Observable<any>;
  deleteScene?(req: HueSRequest, username: string, sceneId: string): Observable<any>;

  // 6. Sensors API
  getAllSensors?(req: HueSRequest, username: string): Observable<any>;
  createSensor?(req: HueSRequest, username: string, body: any): Observable<any>;
  findNewSensors?(req: HueSRequest, username: string): Observable<any>;
  getNewSensors?(req: HueSRequest, username: string): Observable<any>;
  getSensor?(req: HueSRequest, username: string, sensorId: string): Observable<any>;
  updateSensor?(req: HueSRequest, username: string, sensorId: string, body: any): Observable<any>;
  changeSensorConfig?(req: HueSRequest, username: string, sensorId: string, body: any): Observable<any>;
  changeSensorState?(req: HueSRequest, username: string, sensorId: string, body: any): Observable<any>;
  deleteSensor?(req: HueSRequest, username: string, sensorId: string): Observable<any>;

  // 7. Configuration API
  getFullState?(req: HueSRequest, username: string): Observable<any>;
  createUser?(req: HueSRequest, devicetype: string, generateclientkey?: boolean): Observable<string>;
  getConfig?(req: HueSRequest, username: string): Observable<any>;
  modifyConfig?(req: HueSRequest, username: string, body: any): Observable<any>;
  deleteUser?(req: HueSRequest, applicationKey: string, element: string): Observable<any>;

  // 8. Info API (deprecated as of 1.15)
  getAllTimezones?(req: HueSRequest, username: string): Observable<any>;

  // 9. Resourcelinks API
  getAllResourceLinks?(req: HueSRequest, username: string): Observable<any>;
  createResourceLinks?(req: HueSRequest, username: string, body: any): Observable<any>;
  getResourceLinks?(req: HueSRequest, username: string, resourceLinksId: string): Observable<any>;
  updateResourceLinks?(req: HueSRequest, username: string, resourceLinksId: string, body: any): Observable<any>;
  deleteResourceLinks?(req: HueSRequest, username: string, resourceLinksId: string): Observable<any>;


  // 10. Capabilities API
  getAllCapabilities?(req: HueSRequest, username: string): Observable<any>;

  // Fallback
  onFallback?(req: HueSRequest, res: HueSResponse): Observable<any>;
}
