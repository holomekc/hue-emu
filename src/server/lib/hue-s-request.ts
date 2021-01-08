export interface HueSRequest {
    url: string;
    method: string;
    body: any;
    params: ParamsDictionary;
    ip: string;
    ips: string[] | undefined;
    headers: any;
}

export interface ParamsDictionary { [key: string]: string; }
export type ParamsArray = string[];
export type Params = ParamsDictionary | ParamsArray;