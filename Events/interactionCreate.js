const { Client, PermissionsBitField, InteractionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

const noblox = require('noblox.js');
const { validateInputTools } = require('openai/lib/ResponsesParser.js');

/**
 * 
 * @param {Client} bot
 * @param {Interaction} interaction
 */

module.exports.execute = async(bot, interaction) => {
    if (interaction.isAutocomplete()) {
        const serverData = await db.get(`ServerSetup_${interaction.guild.id}`)
        const serverSettings = await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`) && await db.get(`ServerSetup_${interaction.guild.id}.groupid`) && await db.get(`ServerSetup_${interaction.guild.id}.minrank`)
        if (!(serverData && serverSettings)) return;
        try {
            const RobloxGroup = serverData.groupid
            const RobloxCookie = serverData.RobloxCookie
            if (interaction.commandName === 'rank') {
                const focusedOption = interaction.options.getFocused(true);
                if (focusedOption.name === 'rank') {
                    const groupInfo = await noblox.getGroup(RobloxGroup)
                    const rank = await noblox.getRankInGroup(RobloxGroup, groupInfo.owner.userId)
                    const ownerrole = await noblox.getRole(RobloxGroup, rank)
                    if (RobloxCookie) {
                        await noblox.setCookie(RobloxCookie, interaction.guild.id)
                        const groupbot = (await noblox.getAuthenticatedUser()).id
                        const botrank = await noblox.getRankInGroup(RobloxGroup, groupbot)
                        const botrole = await noblox.getRole(RobloxGroup, botrank)
                        const grouproles = await noblox.getRoles(RobloxGroup)
                        const focusedValue = interaction.options.getFocused();
                        values = ["Guest", botrole.name, ownerrole.name]
                        const filtered = grouproles.filter((role) => role.name.toLowerCase().startsWith(focusedValue.toLowerCase()) && !values.includes(role.name) && role.id !== botrole.id);
                        if (filtered) {
                            await interaction.respond(
                                filtered.slice(0, 25).map(role => ({ name: role.name, value: role.name })),
                            );
                        }
                    }
                }

                if (focusedOption.name === 'username') {
                    const focusedValue = focusedOption.value;
                    fetch(`https://www.roblox.com/users/profile?username=${focusedValue}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; }}).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)
                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
            if (interaction.commandName === 'demote') {
                if (interaction.options.get('username')) {
                    const name = await interaction.options.get('username').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; } return r.url.match(/\d+/)[0]; }).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)

                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
            if (interaction.commandName === 'promote') {
                if (interaction.options.get('username')) {
                    const name = await interaction.options.get('username').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; } return r.url.match(/\d+/)[0]; }).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)
                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
            if (interaction.commandName === 'forceverify') {
                const options = interaction.options;
                try {
                    const name = options.get('rblxusername') ? options.get('rblxusername').value : options.get('nickname').value;
                    const response = await fetch(`https://www.roblox.com/users/profile?username=${name}`)

                    if (!response.ok || response.status != 200 || response.status == 429) {
                        return;
                    }

                    const id = response.url.match(/\d+/)[0];
                    const username = await noblox.getUsernameFromId(id);
                    const userId = await noblox.getIdFromUsername(username)

                    if (options.get('nickname')) {
                        const displayName = await noblox.getUserInfo(userId)
                        await interaction.respond([
                            { name: 'Display Name', value: displayName.displayName },
                            { name: 'Smart Name', value: `${displayName.displayName} (@${username})` },
                            { name: 'Username', value: username },
                        ]);
                    } else if (options.get('rblxusername')) {
                        await interaction.respond([
                            { name: `${username} (${userId})`, value: username },
                        ]);
                    }
                } catch (error) {
                    return;
                }
            }
            if (interaction.commandName === 'unforceverify') {
                if (interaction.options.get('rblxusername')) {
                    const name = await interaction.options.get('rblxusername').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; } return r.url.match(/\d+/)[0]; }).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)
                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
            if (interaction.commandName === 'unverify') {
                if (interaction.options.get('username')) {
                    const name = await interaction.options.get('username').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; } return r.url.match(/\d+/)[0]; }).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)
                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
            if (interaction.commandName === 'verify') {
                const options = interaction.options;

                try {
                    const name = options.get('username') ? options.get('username').value : options.get('nickname').value;
                    const response = await fetch(`https://www.roblox.com/users/profile?username=${name}`);

                    if (!response.ok || response.status != 200 || response.status == 429) {
                        return;
                    }

                    const id = response.url.match(/\d+/)[0];
                    const username = await noblox.getUsernameFromId(id)
                    const userId = await noblox.getIdFromUsername(username)

                    if (options.get('nickname')) {
                        const displayName = await noblox.getUserInfo(userId)
                        await interaction.respond([
                            { name: 'Display Name', value: displayName.displayName },
                            { name: 'Smart Name', value: `${displayName.displayName} (@${username})`},
                            { name: 'Username', value: username },
                        ]);
                    } else if (options.get('username')) {
                        await interaction.respond([
                            { name: `${username} (${userId})`, value: username },
                        ]);
                    }
                } catch (error) {
                    return;
                }
            }
            if (interaction.commandName === 'setnick') {
                const options = interaction.options;
                
                try {
                    const name = options.get('username') ? options.get('username').value : options.get('nickname').value;
                    const response = await fetch (`https://www.roblox.com/users/profile?username=${name}`);

                    if (!response.ok || response.status != 200 || response.status == 429) {
                        return;
                    }

                    const id = response.url.match(/\d+/)[0];
                    const username = await noblox.getUsernameFromId(id)
                    const userId = await noblox.getIdFromUsername(username)

                    if (options.get('nickname')) {
                        const displayName = await noblox.getUserInfo(userId)
                        await interaction.respond([
                            { name: 'Display Name', value: displayName.displayName },
                            { name: 'Smart Name', value: `${displayName.displayName} (@${username})` },
                            { name: 'Username', value: username },
                        ]);
                    } else if (options.get('username')) {
                        await interaction.respond([
                            { name: `${username} (${userId})`, value: username },
                        ]);
                    }
                } catch (error) {
                    return;
                }
            }
            if (interaction.commandName === 'forcenick') {
                const options = interaction.options;

                try {
                    const name = options.get('username') ? options.get('username').value : options.get('nickname').value;
                    const response = await fetch(`https://www.roblox.com/users/profile?username=${name}`);

                    if (!response.ok || response.status !== 200 || response.status == 429) {
                        return;
                    }

                    const id = response.url.match(/\d+/)[0];
                    const username = await noblox.getUsernameFromId(id)
                    const userId = await noblox.getIdFromUsername(username)

                    if (options.get('nickname')) {
                        const displayName = await noblox.getUserInfo(userId)
                        await interaction.respond([
                            { name: 'Display Name', value: displayName.displayName },
                            { name: 'Smart Name', value: `${displayName.displayName} (@${username})` },
                            { name: 'Username', value: username },
                        ]);
                    } else if (options.get('username')) {
                        await interaction.respond([
                            { name: `${username} (${userId})`, value: username },
                        ]);
                    }
                } catch (error) {
                    return;
                }
            }
            if (interaction.commandName === 'exile') {
                if (interaction.options.get('username')) {
                    const name = await interaction.options.get('username').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; } return r.url.match(/\d+/)[0]; }).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)
                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
            if (interaction.commandName === 'groupban') {
                if (interaction.options.get('username')) {
                    const name = await interaction.options.get('username').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; } return r.url.match(/\d+/)[0]; }).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)
                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
            if (interaction.commandName == 'groupunban') {
                if (interaction.options.get('username')) {
                    const name = await interaction.options.get('username').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; } if (r.status != 200) { return; } if (r.status == 429) { return; } return r.url.match(/\d+/)[0]; }).then(async id => {
                        const username = await noblox.getUsernameFromId(id)
                        const userId = await noblox.getIdFromUsername(username)
                        await interaction.respond([
                            {
                                name: `${username} (${userId})`,
                                value: username
                            }
                        ]);
                    }).catch(() => {
                        return;
                    })
                }
            }
        } catch (error) {
            return;
        }
    }
    if (interaction.isButton()) {
          // Handle different button IDs
          console.log('Button was pressed')
          if (interaction.customId === 'claim') { // If the button ID is claim continue.
          
            if (interaction.member.permissions.any([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.Administrator])) { // If the member clicking the button has any of these permissions continue.
              // Code to run when 'myButtonId' is clicked
           await interaction.message.edit({ components: [ new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId('close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger)).addComponents( new ButtonBuilder().setCustomId('closewithreason').setLabel('Close with Reason').setEmoji('🗒️').setStyle(ButtonStyle.Danger)) ] });
            interaction.reply({ content: `Your ticket has been claimed by ${interaction.member.user}\n\nPlease explain how we can assist you today with your ticket!` })
            } else { // Member clicking the button doesn't have permission therefore show them an error message.
              interaction.reply({ content: `You don't have permission to claim this ticket!\n\n**Only Staff** may claim tickets!`, flags: MessageFlags.Ephemeral })
            }
          }
          
          if (interaction.customId === 'close') { // Close ticket button was clicked so we are going to delete the ticket channel that was created.
            // Code to run when 'myButtonId' is clicked
            interaction.message.edit({ components: [] })
            interaction.reply({ content: `This ticket will be deleting in 5 Minutes!`})
           setTimeout(async () => {
           await interaction.deleteReply().catch(() => {
            return;
           })
           await interaction.channel.delete().catch(() => {
            return;
           })
           }, 300000)
          }
  
          if (interaction.customId === 'closewithreason') { // Close ticket with reason was clicked so open up a form modal to insert the reason.
            // Handle the button click and open the form
            const modal = new ModalBuilder()
          .setCustomId('closewithreasonmodal')
          .setTitle('Close')
          .addComponents([
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('closereasoninput')
                .setLabel('Reason:')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true),
            ),
          ]);
            interaction.showModal(modal);
          }
  
          if (interaction.customId === 'approve') {
            const modal = new ModalBuilder()
            .setCustomId('approvemodal')
            .setTitle('Approve')
            .addComponents([
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('approveinput')
                  .setLabel('Username:')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true),
              ),
            ]);
            await interaction.showModal(modal);
          }
  
          if (interaction.customId === 'deny') {
            const modal = new ModalBuilder()
            .setCustomId('denymodal')
            .setTitle('Deny')
            .addComponents([
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('denyinput')
                  .setLabel('Username:')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true),
              ),
            ]);
            await interaction.showModal(modal);
          }
  
          if (interaction.customId === 'serversetup') { // Server setup button was clicked so open up a modal to fill in the setting configs for the server.
            // Handle the button click and open the form
            const modal = new ModalBuilder()
          .setCustomId('serversetupmodal')
          .setTitle('Server Setup')
          .addComponents([
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('setcookieinput')
                .setLabel('Roblox Cookie:')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true),
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('setgroupinput')
                .setLabel('Roblox Group ID:')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('setminrankinput')
                .setLabel('Minimum Rank:')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('setgameidinput')
                .setLabel('Verification Game ID:')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            ),
          ]);
          await interaction.showModal(modal);
            }
  
            if (interaction.customId === 'setuplogs') { // Setup logs button was clicked so open a modal to fill in the log channel settings.
              // Handle the button click and open the form
              const modal = new ModalBuilder()
            .setCustomId('setuplogsmodal')
            .setTitle('Logs Setup')
            .addComponents([
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('setshoutchannel')
                  .setLabel('Roblox Group Shout Channel ID:')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true),
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('setserverlogchannel')
                  .setLabel('Discord Logs Channel ID:')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('setsuggestionchannel')
                  .setLabel('Suggestions Channel ID:')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('setticketchannel')
                  .setLabel('Ticket Channel ID:')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
              ),
            ]);
            await interaction.showModal(modal);
              }
    }
    function containsNumber(str) {
        return /^\d+$/.test(str);
    }
    if (interaction.type === InteractionType.ModalSubmit) {
  
            if (interaction.customId === 'closewithreasonmodal') {
              const response = interaction.fields.getTextInputValue('closereasoninput');
              await interaction.deferReply();
          
              const embed = new EmbedBuilder()
                  .setTitle('Ticket Closed!')
                  .setDescription(`Your ticket has been closed!\n\n**Reason:** ${response}\n\nIf you are still having issues, please open another ticket by running **/ticket** command in ${interaction.guild.name} bot commands channel!`)
                  .setColor('Red')
                  .setAuthor({ name: interaction.member.user.username, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now())
                  .setFooter({ text: interaction.guild.name });
          
              try {
                  const members = interaction.channel.members;
                  for (const [memberId, member] of members) {
                      const dbMemberId = await db.get(`Tickets_${interaction.guild.id}_${member.user.id}.discordid`);
          
                      if (dbMemberId === member.user.id) {
                              const targetUser = await interaction.guild.members.fetch(dbMemberId);
                              await targetUser.send({ embeds: [embed] }).catch(async () => {
                                await interaction.editReply(':x: **ERROR** | Failed to DM this user! *This message will auto-delete in 30 seconds!*');
                              setTimeout(() => interaction.deleteReply().catch(() => {}), 30000);
                              })
          
                          await db.delete(`Tickets_${interaction.guild.id}_${member.user.id}`);
                      }
                  }
          
                  await interaction.channel.delete().catch(() => {
                    return;
                  })
              } catch (error) {
                  await interaction.editReply(':x: **ERROR** | Failed to close the ticket.');
              }
          }    
  
            if (interaction.customId === 'approvemodal') {
              const response = interaction.fields.getTextInputValue('approveinput');
                await interaction.deferReply();
                if (!interaction.member.permissions.any([PermissionsBitField.Flags.Administrator])) return interaction.editReply(`:x: **ERROR** | You don't have permission to Approve this application!`)
                  const RobloxUser = await noblox.getIdFromUsername(response).catch(() => {
                  return interaction.editReply(`:x: **ERROR** | ${response} does not exist! Please try another username!`).then(msg => {
                    setTimeout(() => {
                      msg.deleteReply().catch(() => {
                        return;
                      })
                    }, 600000)
                  })
                })
  
                if (RobloxUser) {
                await interaction.message.edit({components: []})
                await interaction.editReply(`:white_check_mark: **APPROVED** | ${response} has Passed for YT mod! Please ask them for their YT username!`)
                }
            }
  
            if (interaction.customId === 'denymodal') {
              const response = interaction.fields.getTextInputValue('denyinput');
               await interaction.deferReply();
               if (!interaction.member.permissions.any([PermissionsBitField.Flags.Administrator])) return interaction.editReply(`:x: **ERROR** | You don't have permission to Deny this application!`).then(msg => { setTimeout(() => { msg.deleteReply().catch(() => { return; })}, 10000)})
                 const RobloxUser = await noblox.getIdFromUsername(response).catch(() => {
                  return interaction.editReply(`:x: **ERROR** | ${response} does not exist! Please try another username!`).then(msg => {
                    setTimeout(() => {
                      msg.deleteReply().catch(() => {
                        return;
                      })
                    }, 10000)
                  })
                })
                
                if (RobloxUser) {
                await interaction.message.edit({components: []})
                await interaction.editReply(`:x: **DENIED** | ${response} has Failed for YT mod! Please let them know their results!`)
                }
            }
  
            if (interaction.customId === 'serversetupmodal') {
              await interaction.deferReply({ flags: MessageFlags.Ephemeral })
              const response = interaction.fields.getTextInputValue('setcookieinput');
              const response2 = interaction.fields.getTextInputValue('setgroupinput');
              const response3 = interaction.fields.getTextInputValue('setminrankinput');
              const response4 = interaction.fields.getTextInputValue('setgameidinput');
              if (response.toLowerCase().includes('warning:-') && containsNumber(response2) && containsNumber(response3) && containsNumber(response4)) {
              await interaction.editReply(`✅ **SUCCESS** | This server has been set up successfully!\nThis message will auto-delete in 5 seconds!`).then(() => {
                setTimeout(() => {
                 interaction.deleteReply().catch(() => {
                  return;
                 })
                }, 5000)
              })
              await db.set(`ServerSetup_${interaction.guild.id}`, { rblxcookie: response, groupid: response2, minrank: response3, gameid: response4})
              const RobloxCookie = db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`) || response;
              if (RobloxCookie) {
              await noblox.setCookie(RobloxCookie, interaction.guild.id).catch(() => {
                interaction.editReply(`:x: **ERROR** | ${err.message}`)
              })
              const CurrentUser = (await noblox.getAuthenticatedUser()).name;
              console.log(`${CurrentUser} Logged in.`)
              if (!CurrentUser) return;
              interaction.guild.members.me.setNickname(CurrentUser);
              }
            } else {
              interaction.editReply(`:x: **ERROR** | Failed to setup this server! **Did you include the Full _|WARNING:- in your cookie and are the other values a number?**\nThis message will auto-delete in 5 seconds!`).then(() => {
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
                }, 5000)
              })
            }
            }
  
            if (interaction.customId === 'setuplogsmodal') { // Log settings were submitted so save the settings to that specific server. Useful for handling multi-guilds.
              await interaction.deferReply({ flags: MessageFlags.Ephemeral })
              const response = interaction.fields.getTextInputValue('setshoutchannel');
              const response2 = interaction.fields.getTextInputValue('setserverlogchannel');
              const response3 = interaction.fields.getTextInputValue('setsuggestionchannel');
              const response4 = interaction.fields.getTextInputValue('setticketchannel');
              if (containsNumber(response) && containsNumber(response2) && containsNumber(response3) && containsNumber(response4)) {
              await interaction.editReply(`✅ **SUCCESS** | Logs have been successfully configured!\nThis message will auto-delete in 5 seconds!`).then(() => {
                setTimeout(() => {
                 interaction.deleteReply().catch(() => {
                  return;
                 })
                }, 5000)
              })
              await db.set(`LogsSetup_${interaction.guild.id}`, { shoutchannel: response, serverlogs: response2, suggestionchannel: response3, ticketchannel: response4 })
            } else {
              interaction.editReply(`:x: **ERROR** | Failed to setup Logs for this server! **All Values must be a number! Make sure you have Developer mode enabled on Discord and Copy Channel ID!**\nThis message will auto-delete in 10 seconds!`).then(() => {
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
                }, 5000)
              })
            }
          }
    }
    if (interaction.isCommand()) {
        const command = interaction.commandName

        if (bot.commands.has(command)) {
            bot.commands.get(command).slashexecute(bot, interaction)
        }
    }
}