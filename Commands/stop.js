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
    name: 'Stop',
    description: 'Stops the current song and clears the Queue.',
    data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the current song and clears the Queue.'),
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
            queue.node.stop()
            await interaction.editReply({ content: `Queue has cleared and current song has stopped! If you would like to play again use the **/play** command\n**This message will Auto-Delete in 5 seconds!**`, }).then(() => {
                Promise.all([
                interaction.member.voice.channel.members.forEach((member) => { member.voice.disconnect() }),
                interaction.guild.members.me.voice.disconnect()
                ]);
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
