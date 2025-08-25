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
const { QuickDB } = require("quick.db");
const db = new QuickDB();
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
            let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`**:x: ERROR** | This a ROBLOX Command. Roblox Commands haven't been setup! Please ask the Owner to setup the bot for Roblox Commands!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )
            const username = interaction.options.getString('rblxusername');
            const discorduser = interaction.options.getUser('discordusername');
            const nickname = interaction.options.getString('nickname');
            if (nickname.length > 32) return interaction.editReply(`:x: **ERROR** | Your nickname is too long! Please choose Username or Displayname format!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )
        const member = await interaction.guild.members.fetch(discorduser.id);
            try {
                let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                const id = await noblox.getIdFromUsername(username)
                const rank = await noblox.getRankInGroup(groupid, id)
                const role1 = await noblox.getRole(groupid, rank)
                if (username) {
                    interaction.editReply({ content: `:white_check_mark: **SUCCESS** | You have successfully force verified ${username}\n**This message will Auto-Delete in 10 seconds!**` }).then(
                 setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
                 )
                    let embed4 = new EmbedBuilder()
                    .setTitle(`**${interaction.guild.name} Verification!**`)
                    .setColor('Yellow')
                    .setDescription(`Hello ${username}, They are already Verified!`)
                    .setFooter({ text: `They can only verify once! | This message will Auto-Delete in 5 seconds!`, })
                    .setTimestamp(Date.now())
            let rblx = await db.get(`RobloxInfo_${interaction.guild.id}_${member.user.id}.robloxusername`);
            let rblxid = await db.get(`RobloxInfo_${interaction.guild.id}_${member.user.id}.robloxid`);
                if (rblx && rblxid) return interaction.channel.send({ embeds: [embed4]}).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
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
          const botHighestRole = interaction.guild.members.me.roles.highest;

                 await db.set(`RobloxInfo_${interaction.guild.id}_${member.user.id}`, { discordid: member.user.id, robloxid: id, robloxusername: username })
                 await db.set(`Verification_${interaction.guild.id}_${id}`, { discordid: member.user.id, robloxid: id });
                 if (!member.manageable) return interaction.channel.send({ embeds: [embed3]}).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
                  }, 5000)
              })
                 member.setNickname(nickname)
                 if (member && role && role2) {
                    const rolesToAdd = [];
                
                    // Check if the member already has the roles
                    if (!member.roles.cache.has(role.id)) {
                        if (role.position < botHighestRole.position) {
                            rolesToAdd.push(role.id);
                        }
                    }
                
                    if (!member.roles.cache.has(role2.id)) {
                        if (role2.position < botHighestRole.position) {
                            rolesToAdd.push(role2.id);
                        }
                    }
                
                    // Add roles if there are any to add
                    if (rolesToAdd.length > 0) {
                        await member.roles.add(rolesToAdd);
                    }
                }
                
                } else {
                    interaction.editReply({ content: `:x: **ERROR** | Failed to force verify ${username}\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                        })
                    }, 10000)
                    )
                }
            } catch (err) {
                console.log(err)
            }
        }
    }
