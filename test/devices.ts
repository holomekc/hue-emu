export const devices = {
    '1': {
        state: {
            on: false,
            bri: 254,
            ct: 439,
            colormode: 'ct',
            reachable: true,
            mode: 'homeautomation',
            alert: 'none'
        },
        type: 'Color temperature light',
        name: 'Hueemu',
        modelid: 'LTW012',
        uniqueid: '608af93f-217c-4cf5-929c-e7964aa2a17d',
        manufacturername: 'Philips',
        swversion: '11111',
        config: {
            archetype: 'classicbulb',
            function: 'functional',
            direction: 'omnidirectional'
        },
        capabilities: {
            certified: true,
            streaming: {
                renderer: false,
                proxy: false
            },
            control: {
                mindimlevel: 1000,
                maxlumen: 250,
                ct: {
                    min: 153,
                    max: 500
                }
            }
        }
    },
    '2': {
        state: {
            on: false,
            bri: 254,
            hue: 14927,
            sat: 132,
            effect: 'none',
            ct: 439,
            colormode: 'hs',
            reachable: true,
            mode: 'homeautomation',
            alert: 'none'
        },
        type: 'Extended color light',
        name: 'Hueemu',
        modelid: 'LCT003',
        uniqueid: '75844ca5-9b91-4e17-bd51-79029ad276ec',
        manufacturername: 'Philips',
        swversion: '11111',
        config: {
            archetype: 'spotbulb',
            function: 'mixed',
            direction: 'downwards'
        },
        capabilities: {
            certified: true,
            streaming: {
                renderer: false,
                proxy: false
            },
            control: {
                mindimlevel: 1000,
                maxlumen: 250,
                ct: {
                    min: 153,
                    max: 500
                },
                colorgamuttype: 'B',
                colorgamut: [
                    [
                        0.6750,
                        0.3220
                    ],
                    [
                        0.4090,
                        0.5180
                    ],
                    [
                        0.1670,
                        0.0400
                    ]
                ],
            }
        }
    },
    '3': {
        state: {
            on: false,
            bri: 254,
            reachable: true,
            mode: 'homeautomation',
            alert: 'none'
        },
        type: 'Dimmable light',
        name: 'Hueemu',
        modelid: 'LWB010',
        uniqueid: '44df4f5f-49d9-4580-90f6-0790a59a77a1',
        manufacturername: 'Philips',
        swversion: '11111',
        config: {
            archetype: 'classicbulb',
            function: 'functional',
            direction: 'omnidirectional'
        },
        capabilities: {
            certified: true,
            streaming: {
                renderer: false,
                proxy: false
            },
            control: {
                mindimlevel: 1000,
                maxlumen: 250,
                ct: {
                    min: 153,
                    max: 500
                }
            }
        }
    }
};