const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType, Player, useQueue } = require('discord-player')
module.exports = {
    name: 'Play',
    description: 'Plays music in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays music in the Discord Server!')
    .addSubcommand((subcommand)=>
            subcommand
            .setName("song")
            .setDescription("Loads a single song from a url")
            .addStringOption((option) => option.setName("url").setDescription("the song's url").setRequired(true))
            )
    .addSubcommand((subcommand)=>
            subcommand
            .setName("playlist")
            .setDescription("Loads a playlist of songs from a url")
            .addStringOption((option) => option.setName("playlist").setDescription("the playlist's url").setRequired(true))
            )
    .addSubcommand((subcommand)=>
            subcommand
            .setName("search")
            .setDescription("Searches for song based on provided keywords")
            .addStringOption((option) => option.setName("search").setDescription("The search keywords").setRequired(true))
            ),
        /**
         * 
         * @param {Client} bot
         * @param {Message} message
         * @param {String[]} args
         */
        async execute(bot, message, args) {},

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            const player = bot.player;
             //console.log(player.scanDeps());player.on('debug',console.log).events.on('debug',(_,m)=>console.log(m));

            const queue = player.nodes.create(interaction.guild, { metadata: interaction.channel,

                autoSelfDeaf: true, 
                leaveOnEnd: false, 
                leaveOnStop: false, 
                leaveOnEmpty: false, 
                leaveOnEndCooldown: 10000,
                leaveOnEmptyCooldown: 10000, 
                ytdlOptions: { 
                  quality: "highest", 
                  filter: "audioonly", 
                  highWaterMark: 1 << 25, 
                  dlChunkSize: 0, 
                },  
                initialVolume: 100,
                bufferingTimeout: 30, // Increase the buffering timeout to 30 seconds
                spotifyBridge: true,
                disableVolume: false,
                volumeSmoothness: 0.08, 
              });

            let url = interaction.options.getString("url");
            let url2 = interaction.options.getString("playlist");
            let url3 = interaction.options.getString("search");
        try {
          await interaction.deferReply()
            if (!interaction.member.voice.channel)
            return interaction.editReply({ content: `You must be in a Voice Channel to run this command!\n**This message will Auto-Delete in 10 seconds!**`, }).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )
            if (!queue.connection) await queue.connect(interaction.member.voice.channel)
                const embed = new EmbedBuilder()
                if (interaction.options.getSubcommand() === "song") {
                    const result = await player.search(url, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.SOUNDCLOUD_SONG
                    })
                    //console.log(result.tracks)
                    if (result.tracks.length === 0)
                    return interaction.editReply("No Results").then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )

                    const song = result.tracks[0]
                    await queue.addTrack(song)
                  embed
                  .setTitle(`**Song Player**`)
                  .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                  .setThumbnail(song.thumbnail)
                  .setFooter({ text: `Duration: ${song.duration}`})
                  .setTimestamp(Date.now())
                  if (!queue.isPlaying()) {
         await queue.node.play()
                await interaction.editReply({
                    embeds: [embed]
                }).then(
    setTimeout(() => {
      interaction.deleteReply().catch(() => {
        return;
      })
  }, 5000)
)
                }
             } else if (interaction.options.getSubcommand() === "playlist") {
                    const result = await player.search(url2, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.SOUNDCLOUD_PLAYLIST
                    })

                    if (result.playlist.tracks.length === 0)
                    return interaction.editReply("No Results").then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )

                    const playlist = result.playlist
                    console.log(playlist.tracks.length)
                    await queue.addTrack(playlist)
                  embed
                  .setTitle(`**Playlist Player**`)
                  .setDescription(`**${playlist.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the Queue`)
                  .setThumbnail(playlist.thumbnail)
                  .setTimestamp(Date.now())
                   if (!queue.isPlaying()) {
         await queue.node.play()
                await interaction.editReply({
                    embeds: [embed]
                }).then(
    setTimeout(() => {
      interaction.deleteReply().catch(() => {
        return;
      })
  }, 5000)
)
                }
        } else if (interaction.options.getSubcommand() === "search") {

            const result = await player.search(url3, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.SOUNDCLOUD_SEARCH
                    })

            if (result.tracks.length === 0)
            return interaction.editReply({ content: `No Results\n**This message will Auto-Delete in 10 seconds!**`, }).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )

            const song = result.tracks[0]
            console.log(song)
           queue.addTrack(song)
            if (song) {
            embed
          .setTitle(`**Search Player**`)
                  .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                  .setThumbnail(song.thumbnail)
                  .setFooter({text: `Duration: ${song?.duration} | This message will Auto-Delete in 5 seconds!`})
                  .setTimestamp(Date.now())  
       
        }

        player.events.on('playerError', async(queue, error) => {
          console.log(queue, error)
        })

        /*player.events.on('emptyQueue', () => {
            Promise.all([
            interaction.member.voice.channel.members.forEach((member) => { member.voice.disconnect() }),
            interaction.guild.members.me.voice.disconnect()
            ]);
        })*/

     if (!queue.isPlaying()) {
      console.log('song is playing')
         await queue.node.play()
     }
    await interaction.editReply({
       embeds: [embed]
   }).then(
    setTimeout(() => {
      interaction.deleteReply().catch(() => {
        return;
      })
  }, 5000)
)
        }
    } catch (err) {
        console.log(err.message)
        await interaction.editReply({ content: `No Results\n**This message will Auto-Delete in 10 seconds!**`, }).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
              return;
            })
        }, 10000)
        )
    }
        },
}
