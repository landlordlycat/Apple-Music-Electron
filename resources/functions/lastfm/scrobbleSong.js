const LastfmAPI = require('lastfmapi')
const apistuff = require('./creds.json')
const fs = require('fs');
const {lfmauthenticate} = require("./authenticate");
const {join} = require('path')
const HomeDirectory = require('os').homedir();
const {app} = require('electron')

exports.scrobble = function(attributes) {
    const lfm = new LastfmAPI({
        'api_key': apistuff.apikey,
        'secret': apistuff.secret
    });

    let UserFilesDirectory;

    switch (process.platform) {
        case "linux":
            UserFilesDirectory = join(HomeDirectory, ".config/Apple Music/")
            break;

        case "win32": // Windows
            UserFilesDirectory = join(HomeDirectory, 'Documents/Apple Music/')
            break;

        case "darwin": // MacOS
            UserFilesDirectory = join(HomeDirectory, 'Library/Application Support/Apple Music/')
            break;

        default:
            UserFilesDirectory = join(HomeDirectory, 'apple-music-electron/')
            break;
    }

    var sessionfile = join(UserFilesDirectory, "session.json")
    if (fs.existsSync(sessionfile)) {
        var sessiondata = require(sessionfile)
        lfm.setSessionCredentials(sessiondata.name, sessiondata.key)
    } else {
        lfmauthenticate()
    }

    console.log("i have actually touched this file.")
    // Scrobble playing song.
    if (attributes.status === true) {
        lfm.setSessionCredentials(sessiondata.name, sessiondata.key)
        if (app.discord.cachedAttributes !== attributes) {
            lfm.track.scrobble({
                'artist': attributes.artistName,
                'track': attributes.name,
                'timestamp': new Date().getTime() / 1000
            }, function (err, scrobbled) {
                if (err) {
                    return console.log('[LastFM] An error occurred while scrobbling', err);
                }

                console.log('[LastFM] Successfully scrobbled:', scrobbled)
            });
        }
    }
}