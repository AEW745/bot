const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    PermissionsBitField
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Lock',
    description: 'Locks current channel and prevents people from chatting.',
    data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks current channel and prevents people from chatting.'),
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
            await interaction.deferReply();
            /*if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!\n**This message will Auto-Delete in 10 seconds!**`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )*/
            try {
                if (!interaction.member.permissions.any([PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.Administrator])) return interaction.editReply("**:x: ERROR** | You don't have permission to run this command!").then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                        })
                    }, 10000)
                )
                interaction.channel.permissionOverwrites.edit("1349012787078369360", {
                    SendMessages: false
                }).catch((err) => {
                    interaction.editReply({ content: `**:x: ERROR** | ${err.message}`})
                }).then(
                interaction.editReply({ content: `**:white_check_mark: SUCCESS** | ${interaction.channel} has been successfully locked!`, ephemeral: false}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                        })
                    }, 10000)
                )
                )
            } catch (error) {
                return;
            }
        },
}
