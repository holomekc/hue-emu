import { HueError } from "./hue-error";

export class HueGroupError extends Error {

  constructor(private readonly _error: HueError) {
    super("HueGroupErrors are normally unwrapped automatically.");
    Object.setPrototypeOf(this, HueGroupError.prototype);
  }

  get error(): HueError {
    return this._error;
  }
}