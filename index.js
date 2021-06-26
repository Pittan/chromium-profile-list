const fs = require('fs');
const os = require('os');
const path = require('path');

const File = require('phylo');

const fsExistsSync = function (file) {
    try {
      fs.accessSync(file);
      return true;
    } catch (ignore) {
      return false;
    }
  }

const osType = process.platform === 'darwin' ? 'macOS' : process.platform === 'win32' ? 'windows' : 'linux';
const variations = {
    CHROME: 0,
    CHROME_CANARY: 1,
    CHROMIUM: 2,
    EDGE: 3,
    EDGE_BETA: 4,
    EDGE_DEV: 5,
    EDGE_CANARY: 6,
}
// Source: https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md
const locations = {
    macOS: [
        `${os.homedir()}/Library/Application Support/Google/Chrome`,
        `${os.homedir()}/Library/Application Support/Google/Chrome Canary`,
        `${os.homedir()}/Library/Application Support/Chromium`
        `${os.homedir()}/Library/Application Support/Microsoft Edge`,
        `${os.homedir()}/Library/Application Support/Microsoft Edge Beta`,
        `${os.homedir()}/Library/Application Support/Microsoft Edge Dev`,
        `${os.homedir()}/Library/Application Support/Microsoft Edge Canary`,
    ],
    windows: [
        `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data`,
        `${process.env.LOCALAPPDATA}\\Google\\Chrome SxS\\User Data`,
        `${process.env.LOCALAPPDATA}\\Chromium\\User Data`
        `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data`
        `${process.env.LOCALAPPDATA}\\Microsoft\\Edge Beta\\User Data`
        `${process.env.LOCALAPPDATA}\\Microsoft\\Edge Dev\\User Data`
        `${process.env.LOCALAPPDATA}\\Microsoft\\Edge SxS\\User Data`
    ],
    // TODO: consider the `~/.config` part can be overriden by $CHROME_VERSION_EXTRA or $XDG_CONFIG_HOME
    linux: [
        `${os.homedir()}/.config/google-chrome`,
        `${os.homedir()}/.config/google-chrome-beta`,
        `${os.homedir()}/.config/chromium`,
        '',
        `${os.homedir()}/.config/microsoft-edge-beta`,
        `${os.homedir()}/.config/microsoft-edge-dev`,
        '',
    ]
};

module.exports = function (variant = variations.CHROME) {
    const browserConfigurationDir = locations[osType][variant];
    if (!browserConfigurationDir) {
        return [];
    }
    return fs.readdirSync(browserConfigurationDir)
        .filter(f => f !== 'System Profile' && fsExistsSync(path.join(locations[osType][variant], f, 'Preferences')))
        .map(p => {
            let profileInfo = File.from(path.join(locations[osType][variant], p, 'Preferences')).load({type: 'json'});
            return {
                displayName: profileInfo.profile.name,
                profileDirName: p,
                profileDirPath: path.join(locations[osType][variant], p),
                profilePictureUrl: profileInfo.profile.gaia_info_picture_url || null
            };
        });
};

module.exports.variations = variations;