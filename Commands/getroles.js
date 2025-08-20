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
    name: 'Getroles',
    description: 'Gets your roles from the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('getroles')
    .setDescription('Gets your roles from the Roblox Group.'),

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
            const username = await db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}.robloxusername`);
            const discorduser = await db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}.discordid`);
            if (!(username && discorduser)) return interaction.editReply({ content: `:x: **ERROR** | You aren't verified with the bot! Please say /verify and follow the steps!\n**This message will Auto-delete in 10 seconds!**`}).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )
            const member = await interaction.guild.members.fetch(discorduser);
            try {
                let id;
                let rank;
                let role1;
                try {
               
                const groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await noblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                    console.log(err.message)
                })
                id = await noblox.getIdFromUsername(username)
                rank = await noblox.getRankInGroup(groupid, id)
                role1 = await noblox.getRole(groupid, rank)
                } catch (error) {
                    return interaction.editReply({ content: `I can't get Roles for unverified users. Please use the **/verify** command and run this command again!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                        })
                    }, 10000)
                    )
                }
                if (username && discorduser) {
                    let findRole2 = role1.name
                    const role2 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                    let findRole3 = "Verified"
                    const role4 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole3))
                    const role5 = member.roles.cache.filter(role => role.managed);


                 try {
                    function getRoles(role5) {
                        // Create an array to store the roles
                        const rolesArray = [];
                    
                        // Loop through each role in role5
                        for (const role of role5.values()) {
                            rolesArray.push(role.id);  // Add the role to the array
                        }

                        rolesArray.push(role2.id)
                        rolesArray.push(role4.id)
                    
                        return rolesArray;  // Return the array of roles
                    }

                    const roles = getRoles(role5);
                    console.log(roles)
const hasAllRoles = roles.some(r => member.roles.cache.has(r.id || r));  // Check if member has all roles
                if (hasAllRoles) {
                if (member && role2 && role4 && roles) {
                await member.roles.set(roles);
                }
                } else {
                    if (member && role2 && role4) {
                        await member.roles.set([role2.id, role4.id]);
                        }
                }
                 } catch (error) {
                    return interaction.editReply({ content: `I don't have permission to update roles for **${username}**\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                            })
                        }, 10000)
                    )
                 }
                 interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully updated roles for ${username}\n**This message will Auto-Delete in 10 seconds!**` }).then(
                 setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
                 )
                } else {
                  await  interaction.editReply({ content: `:x: **ERROR** | Failed to update roles for ${interaction.member}! **Make sure you are verified in the server before using this command!**\n**This message will Auto-Delete in 10 seconds!**` }).then(
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
                  )
                }

            } catch (err) {
                console.log(err.message)
            }
        }
    }
