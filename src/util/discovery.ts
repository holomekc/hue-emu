export const discovery = (host: string, port: number, udn: string) => `<?xml version="1.0" encoding="UTF-8" ?>
<root xmlns="urn:schemas-upnp-org:device-1-0">
    <specVersion>
        <major>1</major>
        <minor>0</minor>
    </specVersion>
    <URLBase>http://${host}:${port}/</URLBase>
    <device>
        <deviceType>urn:schemas-upnp-org:device:Basic:1</deviceType>
        <friendlyName>Hue-Emu</friendlyName>
        <manufacturer>Royal Philips Electronics</manufacturer>
        <manufacturerURL>http://www.philips.com</manufacturerURL>
        <modelDescription>Philips hue Personal Wireless Lighting</modelDescription>
        <modelName>Philips hue bridge 2015</modelName>
        <modelNumber>BSB002</modelNumber>
        <modelURL>http://www.meethue.com</modelURL>
        <serialNumber>111111111111</serialNumber>
        <UDN>uuid:${udn}</UDN>
        <serviceList>
            <service>
                <serviceType>(null)</serviceType>
                <serviceId>(null)</serviceId>
                <controlURL>(null)</controlURL>
                <eventSubURL>(null)</eventSubURL>
                <SCPDURL>(null)</SCPDURL>
         </service>
        </serviceList>
        <presentationURL>index.html</presentationURL>
        <iconList>
            <icon>
                <mimetype>image/png</mimetype>
                <height>48</height>
                <width>48</width>
                <depth>24</depth>
                <url>hue_logo_0.png</url>
            </icon>
            <icon>
                <mimetype>image/png</mimetype>
                <height>120</height>
                <width>120</width>
                <depth>24</depth>
                <url>hue_logo_3.png</url>
            </icon>
        </iconList>
    </device>
</root>`;