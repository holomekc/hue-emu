export const devices = {
  "1": {
    state: {
      on: false,
      bri: 127,
      ct: 392,
      alert: "none",
      colormode: "ct",
      mode: "homeautomation",
      reachable: true,
    },
    swupdate: {
      state: "noupdates",
      lastinstall: "2020-03-04T02:35:58",
    },
    type: "Color temperature light",
    name: "HueEmuTest",
    modelid: "LTW012",
    manufacturername: "Signify Netherlands B.V.",
    productname: "Hue ambiance candle",
    capabilities: {
      certified: true,
      control: {
        mindimlevel: 2000,
        maxlumen: 450,
        ct: {
          min: 153,
          max: 454,
        },
      },
      streaming: {
        renderer: false,
        proxy: false,
      },
    },
    config: {
      archetype: "candlebulb",
      function: "decorative",
      direction: "omnidirectional",
      startup: {
        mode: "powerfail",
        configured: true,
      },
    },
    uniqueid: "00:17:88:01:02:9b:b5:66-0c",
    swversion: "1.50.2_r30933",
    swconfigid: "B2B0522E",
    productid: "Philips-LTW012-1-E14CTv1",
  },
  "2": {
    state: {
      on: false,
      bri: 126,
      alert: "none",
      mode: "homeautomation",
      reachable: true,
    },
    swupdate: {
      state: "noupdates",
      lastinstall: "2020-03-04T02:36:20",
    },
    type: "Dimmable light",
    name: "HueEmuTest2",
    modelid: "LWB010",
    manufacturername: "Signify Netherlands B.V.",
    productname: "Hue white lamp",
    capabilities: {
      certified: true,
      control: {
        mindimlevel: 2000,
        maxlumen: 806,
      },
      streaming: {
        renderer: false,
        proxy: false,
      },
    },
    config: {
      archetype: "classicbulb",
      function: "functional",
      direction: "omnidirectional",
      startup: {
        mode: "powerfail",
        configured: true,
      },
    },
    uniqueid: "00:17:88:01:02:d2:51:77-0b",
    swversion: "1.50.2_r30933",
    swconfigid: "754CE4FC",
    productid: "Philips-LWB010-1-A19DLv4",
  },
};
