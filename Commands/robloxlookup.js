const {
    Client,
    Message,
    CommandInteraction,
    PermissionsBitField,
    EmbedBuilder,
} = require('discord.js');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const roblox = require('noblox.js');

module.exports = {
    name: 'Robloxlookup',
    description: 'Allows staff to lookup a member roblox account using discord ID.',
    data: new SlashCommandBuilder()
    .setName('robloxlookup')
    .setDescription('Allows staff to lookup a member roblox account using discord ID.')
    .addUserOption(option =>
        option.setName('discorduser')
        .setDescription('Select a Discord user').setRequired(true)
    ),
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
        let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: false});
            if (!serversetup) return interaction.editReply(`**:x: ERROR** | This a ROBLOX Command. Roblox Commands haven't been setup! Please ask the Owner to setup the bot for Roblox Commands!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )
            if (!interaction.member.permissions.any([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageMessages])) return interaction.editReply(`**You do Not have permission to use this command!**`).then(message => {
                setTimeout(() => {
                    message.delete().catch(() => {
                        return;
                    })
                }, 5000)
            })
        const discorduser = interaction.options.getUser('discorduser');
        const member = await interaction.guild.members.fetch(discorduser.id);
        const RobloxAccount = await db.get(`RobloxInfo_${interaction.guild.id}_${member.user.id}.robloxid`);
        const GroupId = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
        try {
            if (!RobloxAccount) return interaction.editReply(`**:x: ERROR** | ${member.user} doesn't have a Roblox Account connected or isn't verified!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )
            const RobloxInfo = await roblox.getUserInfo(RobloxAccount);
            const Grouprole = await roblox.getRankNameInGroup(GroupId, RobloxInfo.id)
            const embed = new EmbedBuilder()
            .setTitle('Roblox Account Lookup!')
            .setColor('Green')
            .setDescription('Looks up a members Roblox account by Discord ID')
            .addFields(
                { name: 'Roblox Username', value: `${RobloxInfo.name}`},
                { name: 'Roblox Displayname', value: `${RobloxInfo.displayName}`},
                { name: 'Roblox UserID', value: `${RobloxInfo.id}`},
                { name: 'Roblox Bio', value: `${RobloxInfo.description}`},
                { name: 'Roblox Group Role', value: `${Grouprole}`},
                { name: 'Roblox Verified?', value: `${RobloxInfo.hasVerifiedBadge}`},
                { name: 'Banned on Roblox?', value: `${RobloxInfo.isBanned}`}
            )
            .setFooter({ text: `${interaction.guild.name} | This message will auto-delete in 10 seconds!`})
            .setTimestamp(Date.now())
            const reply = await interaction.editReply(`**:white_check_mark: SUCCESS** | Successfully found Roblox account!`)
                setTimeout(() => {
                    reply.delete().catch(() => {
                        return;
                    })
                }, 5000)
            const followup = await interaction.followUp({ embeds: [embed] })
                setTimeout(() => {
                    followup.delete().catch(() => {
                        return;
                    })
                }, 10000)
        } catch(err) {
            console.log(err.message)
        }
    }
}