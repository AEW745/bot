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
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Pause',
    description: 'Pauses the currently playing song!',
    data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the currently playing song!'),
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
            //let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            /*if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )*/
            const queue = useQueue(interaction.guild)
        try {
           if (!queue)
            return await interaction.editReply("There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**").then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )

            queue.node.setPaused(true)
            await interaction.editReply("Currently playing song has been paused! Use `/resume` to continue playing the current song.\n**This message will Auto-Delete in 5 seconds!**").then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                    return;
                  })
            }, 5000)
            )
    } catch (err) {
        console.log(err.message)
        interaction.editReply("No Results\n**This message will Auto-Delete in 10 seconds!**").then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
                return;
              })
        }, 10000)
        )
    }
        },
}
