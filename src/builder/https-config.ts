export interface HttpsConfig {
    port: number;
    key: string;
    cert: string;

    // constructor(port: number, key: string, cert: string) {
    //     this._port = port;
    //     this._key = key;
    //     this._cert = cert;
    // }
    //
    //
    // set port(value: number) {
    //     this._port = value;
    // }
    //
    // set key(value: string) {
    //     this._key = value;
    // }
    //
    // set cert(value: string) {
    //     this._cert = value;
    // }
    //
    // get port(): number {
    //     return this._port;
    // }
    //
    // get key(): string {
    //     return this._key;
    // }
    //
    // get cert(): string {
    //     return this._cert;
    // }
}