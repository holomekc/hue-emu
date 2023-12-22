import selfsigned, {CertificateDefinition} from 'selfsigned';

export function isDefined(obj: any): boolean {
    return obj !== null && typeof obj !== 'undefined';
}

export function isUndefined(obj: any): boolean {
    return !isDefined(obj);
}

export function generateCertificate(): CertificateDefinition {
    return selfsigned.generate([
            {name: 'commonName', value: 'hue-emu'},
            {name: 'organizationName', value: 'hue-emu'},
            {name: 'countryName', value: 'DE'}],
        {keySize: 2048, clientCertificate: false, algorithm: 'sha256'});
}