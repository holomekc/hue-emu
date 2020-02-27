/**
 * @see https://developers.meethue.com/develop/hue-api/error-messages/
 *
 * @author Christopher Holomek
 * @since 25.02.2020
 */
import * as util from 'util';
import {HueError} from '../error/hue-error';
import {ErrorMessage} from './error-message';

export class ErrorResponse {
    private error: ErrorMessage;

    public static create(error: HueError, address: string): ErrorResponse {
        return new ErrorResponse(ErrorResponse.createMessage(error, address));
    }

    public static createMessage(error: HueError, address: string): ErrorMessage {
        return new ErrorMessage(error.type, address, util.format(error.description, ...error.params));
    }

    private constructor(error: ErrorMessage) {
        this.error = error;
    }


}