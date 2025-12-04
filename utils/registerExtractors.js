const { Player, AudioFilters, onBeforeCreateStream } = require("discord-player");
const { SoundcloudExtractor } = require("discord-player-soundcloud");
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
            if (track.extractor.identifier === SoundcloudExtractor.identifier || track.extractor.identifier === YoutubeiExtractor.identifier) return await track.extractor?.stream(track);
            return undefined;
        } catch {
            return undefined
        }
    });

    if (extractors.Soundcloud.enabled) {
        console.info("Loading Soundcloud extractor...");
        const soundcloudExt = await player.extractors.register(SoundcloudExtractor, extractors.Soundcloud.config);
        soundcloudExt.priority = extractors.Soundcloud.priority ?? soundcloudExt.priority;
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
    await registerExtractors(player)
}

module.exports = { initPlayer, registerExtractors, reload };