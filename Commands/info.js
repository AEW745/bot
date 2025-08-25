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
const { QuickDB } = require("quick.db");
const db = new QuickDB();

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
            const player = bot.player
            //let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            try {
                
            const queue = useQueue(interaction.guild)
            
            /*if (!serversetup) return interaction.reply({ content: `:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`, ephemeral: true }).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )*/
        
                if (!queue) {
                    return await interaction.reply({
                        content: `There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**`,
                        ephemeral: true
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
            
                await interaction.deferReply({ephemeral: false})
                async function createAndLogProgressBar() {
                    currentProgressBar = createNewProgressBar();
    
                    const song = queue.currentTrack;
                    
                    if (song) {
                        const timeString = song?.duration; // Example: 12 minutes and 36 seconds
                
                        //await interaction.deleteReply()

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setThumbnail(song.thumbnail)
                                    .setDescription(
                                        `Currently Playing [${song.title}](${song.url})\n\n` +
                                            currentProgressBar
                                    )
                                    .setFooter({
                                        text: `This message will Auto-Delete at ${timeString}!`,
                                    }),
                            ],
                        });
                    }
                }
            
                setInterval(() => {
                    createAndLogProgressBar();
                }, 1000); // Create a new progress bar every second
            
                player.events.on('playerFinish', async () => {
                        if (!interaction) return;
                        await interaction.deleteReply().catch(() => {
                            return;
                          })
                });
            } catch (err) {
                console.log(err);
                await interaction.reply({
                    content: `No Results\n**This message will Auto-Delete in 10 seconds!**`,
                    ephemeral: true
                });
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000);
            }            
        },
}
