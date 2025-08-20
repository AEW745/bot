const { Player, AudioFilters, onBeforeCreateStream } = require("discord-player");
const { SoundcloudExtractor } = require("discord-player-soundcloud");
const { YoutubeiExtractor, stream } = require("discord-player-youtubei");
const config = require("../utils/config.json");

const discordPlayerConfig = config.discordPlayer;
const extractors = discordPlayerConfig?.extractors || {};

/**
 * Initializes a new Player instance
 * 
 * @param {Client} client 
 * @returns 
 */
async function initPlayer(client) {
    return new Player(client, {
        skipFFmpeg: discordPlayerConfig?.skipFFmpeg,
        ffmpegPath: discordPlayerConfig?.ffmpegPath,
    });
}

/**
 * Registers all extractors
 * 
 * @param {Player} player 
 * @returns 
 */
async function registerExtractors(player) {
    const ffmpegFilters = discordPlayerConfig?.ffmpegFilters || {};
    for (const filter of Object.entries(ffmpegFilters)) AudioFilters.define(filter[0], filter[1]);

    onBeforeCreateStream(async (track) => {
        try {
           // console.log(track)
            if (track.extractor.identifier === SoundcloudExtractor.identifier || track.extractor.identifier === YoutubeiExtractor.identifier) return await track.extractor?.stream(track);
            return undefined;
        } catch {
            return undefined;
        }
    });

    if (extractors.Soundcloud.enabled) {
        console.info("Loading Soundcloud extractor...");
        const soundcloudExt = await player.extractors.register(SoundcloudExtractor, extractors.Soundcloud.config);
        soundcloudExt.priority = extractors.Soundcloud.priority ?? soundcloudExt.priority;
    }

    if (extractors.Youtubei.enabled || extractors.Youtubei.config.attemptYoutubeSearchEvenIfDisabled.useScraping) {
        console.info("Loading YoutubeiExtractor extractor...");
        const tempYtExt = await player.extractors.register(YoutubeiExtractor, {
            ...getYoutubeExtractorOptions(extractors.Youtubei.config),
        });

        const originalStream = tempYtExt.stream.bind(tempYtExt);

        await player.extractors.unregister(YoutubeiExtractor.identifier);

        let ytExt = null;
        try {
            ytExt = await player.extractors.register(YoutubeiExtractor, {
                ...getYoutubeExtractorOptions(extractors.Youtubei.config),
                createStream: async (track, ext) => {
                    if (extractors.Youtubei.config.useOnesieRequests) {
                        try {
                            const url = await getVideoInfoFromOnesieRequest(track.url, ext.innerTube, ext.innerTube.po_token);
                            const download = await url.download({ format: "mp4", quality: "best", type: "audio" });
                            return createReadableFromWeb(download);
                        } catch (error) {
                            console.error("Failed to get video info from Onesie request:", error);
                            return null;
                        }
                    } else {
                        try {
                            if (!extractors.Youtubei.enabled && extractors.Youtubei.config.attemptYoutubeSearchEvenIfDisabled.useScraping) return null;  
                            return await originalStream(track, ext);
                        } catch (err) {
                            console.warning(`Original stream failed for ${track.url}, falling back to ytdl-core. Error: ${err.message}`);
                            try {
                                const info = await ytdl.getInfo(track.url);
                                if (!info.formats?.length) return null;
                                const format = info.formats
                                    .filter(f => f.hasAudio && (!track.live || f.isHLS))
                                    .sort((a, b) => Number(b.audioBitrate) - Number(a.audioBitrate) || Number(a.bitrate) - Number(b.bitrate))[0];
                                if (!format) return null;
                                return format.url;
                            } catch (ytdlErr) {
                                console.error("ytdl-core also failed:", ytdlErr);
                                return null;
                            }
                        }
                    }
                },
            });

            if (!ytExt) 
                console.error("YoutubeiExtractor registration returned null.");
            else 
                ytExt.priority = extractors.Youtubei.priority ?? ytExt.priority;
        } catch (e) {
            console.error("Failed to register YoutubeiExtractor:", e);
        }
    }
}

/**
 * Reloads all extractors
 * 
 * @param {Player} player 
 * @returns
 */
async function reload(player) {
    await player.extractors.unregisterAll();
    await registerExtractors(player);
}

/**
 * Gets the Youtube extractor options
 * 
 * @param {object} playerconfig 
 * @returns 
 */
function getYoutubeExtractorOptions(playerconfig) {
    const options = {
        streamOptions: {
            useClient: playerconfig?.client || "IOS",
            highWaterMark: playerconfig?.highWaterMark || 1024 * 1024,
        },
    };

    if (playerconfig?.useTVOAuthLogin)
        options.authentication = process.env.YOUTUBE_ACCESS_STRING;

    if (playerconfig?.useCookie) 
        options.cookie = process.env.YOUTUBE_COOKIE;
    
    if (playerconfig?.useServerAbrStream) {
        options.useServerAbrStream = true;
        if (!playerconfig?.usePoToken) playerconfig.usePoToken = true;
    }

    if (playerconfig?.usePoToken) {
        if (!["WEB", "WEB_EMBEDDED"].includes(playerconfig?.client))
            options.streamOptions.useClient = "WEB";
        options.generateWithPoToken = true;
    }

    return options;
}

module.exports = { initPlayer, registerExtractors, reload };