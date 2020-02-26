export function isDefined(obj: any): boolean {
    return obj !== null && typeof obj !== 'undefined';
}

export function isUndefined(obj: any): boolean {
    return !isDefined(obj);
}
