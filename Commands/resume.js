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
    name: 'Resume',
    description: 'Resumes the current song to where you left off.',
    data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the current song to where you left off.'),
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
            const queue = useQueue(interaction.guild);
        try {
           if (!queue)
            return await interaction.editReply("There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**").then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )

            queue.node.setPaused(false)
            await interaction.editReply("The current song has been resumed! Use `/pause` to pause the currently playing song.\n**This message will Auto-Delete in 5 seconds!**").then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                    return;
                  })
            }, 5000)
            )
    } catch (err) {
        console.log(err)
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
