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
    name: 'Unlock',
    description: 'Unlocks current channel and allows people to chat.',
    data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlocks current channel and allows people to chat.'),
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
                if (!interaction.member.permissions.has([PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.Administrator])) return interaction.editReply("**:x: ERROR** | You don't have permission to run this command!").then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                        }, 10000)
                    })
                )
                if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.Administrator])) return interaction.editReply("**:x: ERROR** | I don't have permission to perform this action!").then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                        }, 10000)
                    })
                )
                interaction.channel.permissionOverwrites.edit("1349012787078369360", {
                    SendMessages: true
                }).catch((err) => {
                    interaction.editReply({ content: `**:x: ERROR** | ${err.message}`})
                }).then(
                interaction.editReply({ content: `**:white_check_mark: SUCCESS** | ${interaction.channel} has been successfully unlocked!`, ephemeral: false}).then(
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
