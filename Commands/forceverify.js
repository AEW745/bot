const {
    Client,
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    User,
    Guild,
    Events,
    PermissionsBitField,
} = require('discord.js')

const noblox = require('noblox.js')
require('dotenv').config();
const db = require('quick.db');
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'Forceverify',
    description: 'Force Verifies a member in the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('forceverify')
    .setDescription('Force Verifies a member in the Roblox Group.')
    .addStringOption(option =>
        option.setName('rblxusername')
        .setDescription('What is their Roblox Username?').setRequired(true)
        .setAutocomplete(true)
        )
    .addUserOption(option =>
        option.setName('discordusername')
        .setDescription('What is their Discord Username?').setRequired(true)
        )
    .addStringOption(option =>
        option.setName('nickname')
        .setDescription('Choose a username format').setRequired(true)
        .setAutocomplete(true)
        ),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const username = interaction.options.getString('rblxusername');
            const discorduser = interaction.options.getUser('discordusername');
            const nickname = interaction.options.getString('nickname');
            if (nickname.length > 32) return interaction.editReply(`:x: **ERROR** | Your nickname is too long! Please choose Username or Displayname format!`)
        const member = await interaction.guild.members.fetch(discorduser.id);
            try {
                let groupid = bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                const id = await noblox.getIdFromUsername(username)
                const rank = await noblox.getRankInGroup(groupid, id)
                const role1 = await noblox.getRole(groupid, rank)
                if (username) {
                    interaction.editReply({ content: `:white_check_mark: **SUCCESS** | You have successfully force verified ${username}\n**This message will Auto-Delete in 10 seconds!**` }).then(
                 setTimeout(() => {
                    if (interaction) {
                    interaction.deleteReply()
                    }
                }, 10000)
                 )
                    let embed4 = new EmbedBuilder()
                    .setTitle('**Money Devs Verification!**')
                    .setColor('Yellow')
                    .setDescription(`Hello ${username}, They are already Verified!`)
                    .setFooter({ text: `They can only verify once! | This message will Auto-Delete in 5 seconds!`, })
                    .setTimestamp(Date.now())
            let rblx = bot.db.get(`RobloxInfo_${interaction.guild.id}_${member.id}.robloxusername`);
            let rblxid = bot.db.get(`RobloxInfo_${interaction.guild.id}_${member.id}.robloxid`);
                if (rblx && rblxid) return interaction.channel.send({ embeds: [embed4]}).then(message => {
                    setTimeout(() => {
                        if (message) {
                      message.delete()
                        }
                  }, 5000)
              })
                 let embed3 = new EmbedBuilder()
                 .setTitle('**Money Devs Verification!**')
                 .setColor('Blue')
                 .setDescription(`Hello ${username}, They have been verified but Unable to Update their nickname do to lack of Permissions!`)
                 .setFooter({ text: `Enjoy the Server! | This message will Auto-Delete in 5 seconds!`, })
                 .setTimestamp(Date.now())
                 let findRole = "Verified"
                 let findRole2 = role1.name
                 const role = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                 const role2 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                 if (member && role && role2) {
                if (member.manageable) {
                 await member.roles.add(role.id)
                 await member.roles.add(role2.id)
                } else {
                    await member.roles.add(role.id)
                }
                 }
                 bot.db.set(`RobloxInfo_${interaction.guild.id}_${member.id}`, { discordid: member.id, robloxid: id, robloxusername: username })
                 bot.db.set(`Verification_${interaction.guild.id}_${member.id}_${id}`, { discordid: interaction.member.id, robloxid: id });
                 if (!member.manageable) return interaction.channel.send({ embeds: [embed3]}).then(message => {
                    setTimeout(() => {
                        if (message) {
                      message.delete()
                        }
                  }, 5000)
              })
                 member.setNickname(nickname)
                } else {
                    interaction.editReply({ content: `:x: **ERROR** | Failed to force verify ${username}\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        if (interaction) {
                        interaction.deleteReply()
                        }
                    }, 10000)
                    )
                }
            } catch (err) {
                console.log(err.message)
            }
        }
    }
