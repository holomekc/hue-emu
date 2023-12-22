import { HueBuilder } from "../builder/hue-builder";

export const descriptionXml = (builder: HueBuilder) => `<?xml version="1.0" encoding="UTF-8" ?>
<root xmlns="urn:schemas-upnp-org:device-1-0">
    <specVersion>
        <major>1</major>
        <minor>0</minor>
    </specVersion>
    <URLBase>http://${builder.discoveryHost}:${builder.discoveryPort}/</URLBase>
    <device>
        <deviceType>urn:schemas-upnp-org:device:Basic:1</deviceType>
        <friendlyName>Hue-Emu</friendlyName>
        <manufacturer>Royal Philips Electronics</manufacturer>
        <manufacturerURL>https://github.com/holomekc/hue-emu</manufacturerURL>
        <modelDescription>Philips hue compatible Personal Wireless Lighting</modelDescription>
        <modelName>Philips hue bridge 2015</modelName>
        <modelNumber>BSB002</modelNumber>
        <modelURL>https://github.com/holomekc/hue-emu</modelURL>
        <serialNumber>${builder.mac.replace(/:/g, "")}</serialNumber>
        <UDN>uuid:${builder.udn}</UDN>
        <presentationURL>index.html</presentationURL>
        <iconList>
            <icon>
                <mimetype>image/png</mimetype>
                <height>48</height>
                <width>48</width>
                <depth>24</depth>
                <url>hue_logo_0.png</url>
            </icon>
        </iconList>
    </device>
</root>`;
