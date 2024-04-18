const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType, useQueue } = require('discord-player')

module.exports = {
    name: 'Queue',
    description: 'Displays the current song queue in the Discord Server!',
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current song queue in the Discord Server!')
        .addNumberOption((option) => option.setName("page").setDescription("Page number of the queue").setMinValue(1)),

    async slashexecute(bot, interaction) {
        let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`);
        await interaction.deferReply({ ephemeral: true });
        if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been set up. Please ask the Owner to set up the bot for this server!`);

        const queue = useQueue(interaction.guildId);
        const page = (interaction.options.getNumber("page") || 1) - 1;

        try {
            if (!queue || !queue.isPlaying()) {
                return await interaction.editReply("There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**").then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                );
            }

            const totalPages = Math.ceil(queue.tracks.size / 10) || 1;

            if (page >= totalPages) {
                return await interaction.editReply(`Invalid Page. There are currently a Total of ${totalPages} pages of songs in the Queue.\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                );
            }

            const currentSong = queue.currentTrack;

const queueString = [
    queue.tracks.data.slice(page * 10, page * 10 + 10).map((song, i) => {
        return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`;
    })
].join("\n");

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`**Currently Playing**\n` +
                            (currentSong ? `\`\[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : "None") +
                            `\n\n**Queue**\n${queueString || `None`}`
                        )
                        .setFooter({
                            text: `Page ${page + 1} of ${totalPages} | This message will Auto-Delete in 5 seconds!`
                        })
                        .setThumbnail(currentSong ? currentSong.thumbnail : null)
                ]
            }).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 5000)
            );

        } catch (err) {
            console.error(err.message);
            interaction.editReply({ content: `No Results\n**This message will Auto-Delete in 10 seconds!**` }).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000)
            );
        }
    },
};
