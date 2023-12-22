import selfsigned from "selfsigned";

export const isDefined = (obj: any): boolean => {
  return obj !== null && typeof obj !== "undefined";
};

export const isUndefined = (obj: any): boolean => {
  return !isDefined(obj);
};

export const generateCertificate = (): selfsigned.GenerateResult => {
  return selfsigned.generate(
    [
      { name: "commonName", value: "hue-emu" },
      { name: "organizationName", value: "hue-emu" },
      { name: "countryName", value: "DE" },
    ],
    { keySize: 2048, clientCertificate: false, algorithm: "sha256" }
  );
};
