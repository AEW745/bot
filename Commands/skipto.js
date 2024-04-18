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
    name: 'Skipto',
    description: 'Skips the current song to the specified song track number in the Queue.',
    data: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Skips the current song to the specified song track number in the Queue.')
    .addNumberOption((option) => 
    option.setName('tracknumber').setDescription('The track to skip to').setMinValue(1).setRequired(true)),
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
            const trackNum = interaction.options.getNumber('tracknumber');
        try {
           if (!queue)
            return await interaction.editReply({ content: `There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**`, }).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )

            if (trackNum > queue.tracks.size)
                return await interaction.editReply({ content: `Invalid track number\n**This message will Auto-Delete in 10 seconds!**`, }).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )
            queue.node.skipTo(trackNum - 1)
            await interaction.editReply(`Skipped ahead to track number ${trackNum}\n**This message will Auto-Delete in 5 seconds!**`).then(
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
