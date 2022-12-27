const { parsed } = require("dotenv").config();
module.exports = {
  packagerConfig: {
    name: "ChatGPT",
    executableName: "ChatGPT",
    icon: "images/icon",
    appBundleId: "com.pragtex.chatgpt",
    extendInfo: {
      LSUIElement: "true",
    },
    /*
    osxSign: {
      hardenedRuntime: false,
      gatekeeperAssess: false,
      identity: "Developer ID Application: Lyser.io Ltd (R4PF6TTR6Z)",
    },
    osxNotarize: {
      appBundleId: "com.vincelwt.chatgptmac",
      tool: "notarytool",
      appleId: parsed.APPLE_ID,
      appleIdPassword: parsed.APPLE_PASSWORD,
      teamId: parsed.APPLE_TEAM_ID,
    },
     */
  },
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "mmeggs2",
          name: "chatgpt-electron",
        },
        prerelease: true,
      },
    },
  ],

  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {},
    },
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {},
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};
