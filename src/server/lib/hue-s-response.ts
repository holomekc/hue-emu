export interface HueSResponse {
    setContentType(contentType: string): void;
    send(data: string): void
    json(data: object | any[]): void;
}