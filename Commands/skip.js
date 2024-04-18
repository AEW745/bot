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
    name: 'Skip',
    description: 'Skips the current song to the next song in the Queue.',
    data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current song to the next song in the Queue.'),
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
            let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const queue = useQueue(interaction.guildId);
        try {
           if (!queue)
            return await interaction.editReply({ content: `There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**`, }).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )

            const currentSong = queue.currentTrack

            queue.node.skip()
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription(`${currentSong.title} has been skipped!`).setThumbnail(currentSong.thumbnail).setFooter({ text: `This message will Auto-Delete in 5 seconds!`})
                ]
            }).then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                    return;
                  })
            }, 5000)
            )

    } catch (err) {
        console.log(err.message)
        interaction.editReply({ content: `No Results\n**This message will Auto-Delete in 10 seconds!**`, }).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
                return;
              })
        }, 10000)
        )
    }
        },
}
