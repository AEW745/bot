const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType, useMainPlayer, useQueue } = require('discord-player')

module.exports = {
    name: 'Info',
    description: 'Displays info about the currently playing song.',
    data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Displays info about the currently playing song.'),
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
            const player = useMainPlayer()
            let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const queue = useQueue(interaction.guildId);
            try {
                if (!queue) {
                    return await interaction.editReply({
                        content: `There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**`,
                    }).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    );
                }
            
                function createNewProgressBar() {
                    return queue.node.createProgressBar({
                        queue: false,
                        length: 19,
                        timecodes: {
                            play: queue.position,
                            end: queue.currentTrack?.duration,
                        },
                    });
                }
            
                let currentProgressBar; // Variable to store the current progress bar
            
                async function createAndLogProgressBar() {
                    currentProgressBar = createNewProgressBar();
            
                    const song = queue.currentTrack;
            
                    if (song) {
                        const timeString = song?.duration; // Example: 12 minutes and 36 seconds

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setThumbnail(song.thumbnail)
                                    .setDescription(
                                        `Currently Playing [${song.title}](${song.url})\n\n` +
                                            currentProgressBar
                                    )
                                    .setFooter({
                                        text: `This message will Auto-Delete in ${timeString}!`,
                                    }),
                            ],
                        });
                    }
                }
            
                setInterval(() => {
                    createAndLogProgressBar();
                }, 1000); // Create a new progress bar every second
            
                player.events.on('emptyQueue', () => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                });
            } catch (err) {
                console.log(err.message);
                interaction.editReply({
                    content: `No Results\n**This message will Auto-Delete in 10 seconds!**`,
                });
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000);
            }            
        },
}
