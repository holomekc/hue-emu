export class HueError extends Error {

    // Generic Errors
    static readonly UNAUTHORIZED_USER = new HueError(1, 'unauthorized user');
    static readonly INVALID_JSON = new HueError(2, 'body contains invalid JSON');
    static readonly RESOURCE_NOT_AVAILABLE = new HueError(3, 'resource, %s, not available');
    static readonly METHOD_NOT_AVAILABLE_FOR_RESOURCE = new HueError(4, 'method, %s, not available for resource, %s');
    static readonly MISSING_PARAMETERS = new HueError(5, 'missing parameters in body');
    static readonly PARAMETER_NOT_AVAILABLE = new HueError(6, 'parameter, %s, not available');
    static readonly INVALID_PARAMETER_VALUE = new HueError(7, 'invalid value, %s, for parameter, %s');
    static readonly PARAMETER_NOT_MODIFIABLE = new HueError(8, 'parameter, %s, is not modifiable');
    static readonly TOO_MANY_ITEMS = new HueError(11, 'too many items in list');
    static readonly PORTAL_CONNECTION_REQUIRED = new HueError(12, 'Portal connection required');
    static readonly INTERNAL_ERROR = new HueError(901, 'Internal error, %s');

    // Command Specific Errors
    static readonly LINK_BUTTON_NOT_PRESSED = new HueError(101, 'link button not pressed');
    static readonly DHCP_CANNOT_BE_DISABLED = new HueError(110, 'DHCP cannot be disabled');
    static readonly INVALID_UPDATE_STATE = new HueError(111, 'Invalid updatestate');
    static readonly PARAMETER_NOT_MODIFIABLE_DEVICE_OFF = new HueError(201, 'parameter, %s, is not modifiable. Device is set to off');
    static readonly COMMISSIONABLE_LIGHT_LIST_FULL = new HueError(203, 'Commissionable light list full');
    static readonly GROUP_TABLE_FULL = new HueError(301, 'group could not be created. Group table is full');
    static readonly GROUP_NO_UPDATE_DELETE = new HueError(305, 'It is not allowed to update or delete group of this type');
    static readonly LIGHT_ALREADY_USED = new HueError(306, 'Light is already used in another room');
    static readonly SCENE_BUFFER_FULL = new HueError(402, 'Scene could not be created. Scene buffer in bridge full');
    static readonly SCENE_LOCKED = new HueError(403, 'Scene couldn’t not be removed, because it’s locked');
    static readonly SCENE_GROUP_EMPTY = new HueError(404, 'Scene could not be created, group is empty');
    static readonly SENSOR_TYPE_NOT_ALLOWED = new HueError(501, 'No allowed to create sensor type');
    static readonly SENSOR_LIST_FULL = new HueError(502, 'Sensor list is full');
    static readonly COMMISSIONABLE_SENSOR_LIST_FULL = new HueError(503, 'Commissionable sensor list full');
    static readonly RULE_ENGINE_FULL = new HueError(601, 'Rule engine full');
    static readonly CONDITION_ERROR = new HueError(607, 'Condition error');
    static readonly ACTION_ERROR = new HueError(608, 'Action error');
    static readonly UNABLE_TO_ACTIVATE = new HueError(609, 'Unable to activate');
    static readonly SCHEDULE_LIST_FULL = new HueError(701, 'Schedule list is full');
    static readonly TIME_ZONE_INVALID = new HueError(702, 'Schedule time-zone not valid');
    static readonly SCHEDULE_CANNOT_SET_TIME = new HueError(703, 'Schedule cannot set time and local time');
    static readonly CANNOT_CREATE_SCHEDULE = new HueError(704, 'Cannot create schedule');
    static readonly CANNOT_ENABLE_SCHEDULE = new HueError(705, 'Cannot enable schedule, time is in the past');
    static readonly COMMAND_ERROR = new HueError(706, 'Command error');
    static readonly SOURCE_MODEL_INVALID = new HueError(801, 'Source model invalid');
    static readonly SOURCE_FACTORY_NEW = new HueError(802, 'Source factory new');
    static readonly INVALID_STATE = new HueError(803, 'Invalid state');

    private _params: string[];

    private constructor(private readonly _type: number, private readonly _description: string) {
        super(_description);
        this._params = [];
    }

    get type(): number {
        return this._type;
    }

    get description(): string {
        return this._description;
    }

    get params(): string[] {
        return this._params;
    }

    withParams(...params: string[]): HueError {
        this._params = params;
        return this;
    }
}
