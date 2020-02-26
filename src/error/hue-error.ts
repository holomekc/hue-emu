 export class HueError extends Error{
     static readonly UNAUTHORIZED_USER = new HueError(1, 'unauthorized user');
     static readonly LINK_BUTTON_NOT_PRESSED = new HueError(101, 'link button not pressed');

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
