const { Client, PermissionsBitField, InteractionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, MessageFlags, ActivityType } = require('discord.js');

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
async function getRobloxUser(username) {
  try {
    const id = await noblox.getIdFromUsername(username);
  if (!id) return null;

    const realUsername = await noblox.getUsernameFromId(id);

    return { id, username: realUsername };
  } catch {
    return null;
  }
}


if (interaction.isAutocomplete()) {
    try {
        const serverData = await db.get(`ServerSetup_${interaction.guild.id}`);
        if (!serverData) return interaction.respond([]);

        const RobloxGroup = serverData.groupid;
        const RobloxCookie = serverData.RobloxCookie;

        const focused = interaction.options.getFocused(true);
        const focusedValue = focused.value;

        // --------------- RANK AUTOCOMPLETE ---------------
        if (interaction.commandName === "rank") {
            if (focused.name === "rank") {
    try {
        // Fix field name issues
        const RobloxGroup = serverData.groupid;
        const RobloxCookie = serverData.rblxcookie || serverData.RobloxCookie;

        if (!RobloxGroup || !RobloxCookie) {
            return interaction.respond([]);
        }

        // Ensure noblox is authenticated
        try {
            await noblox.setCookie(RobloxCookie);
        } catch {
            return interaction.respond([]);
        }

        // Get bot user
        let bot;
        try {
            bot = await noblox.getAuthenticatedUser();
        } catch {
            return interaction.respond([]);
        }

        // Get bot role safely
        let botRank = 0;
        try {
            botRank = await noblox.getRankInGroup(RobloxGroup, bot.id);
        } catch {}

        let botRole = { id: -1, name: "" };
        try {
            botRole = await noblox.getRole(RobloxGroup, botRank);
        } catch {}

        const groupInfo = await noblox.getGroup(RobloxGroup);
        const ownerRank = await noblox.getRankInGroup(RobloxGroup, groupInfo.owner.userId);
        const ownerRole = await noblox.getRole(RobloxGroup, ownerRank);

        // Get list of roles
        let groupRoles = [];
        try {
            groupRoles = await noblox.getRoles(RobloxGroup);
        } catch {
            return interaction.respond([]);
        }

        // Roles to exclude
        const blocked = ["Guest", botRole.name, ownerRole.name ];

        const filtered = groupRoles
            .filter((r) => {
                if (blocked.includes(r.name)) return false;
                if (r.id === botRole.id) return false;

                // Handle initial input gracefully
                if (!focusedValue) return true;

                return r.name.toLowerCase().startsWith(focusedValue.toLowerCase());
            })
            .slice(0, 25)
            .map((r) => ({
                name: `${r.name} (Rank: ${r.rank})`,
                value: r.name,
            }));

        return interaction.respond(filtered);
    } catch (err) {
        console.error("Rank autocomplete error:", err);
        return interaction.respond([]);
    }
}

            if (focused.name === "username") {
                const user = await getRobloxUser(focusedValue);
                if (!user) return interaction.respond([]);

                return interaction.respond([
                    { name: `${user.username} (${user.id})`, value: user.username }
                ]);
            }
        }

        // --------------- USERNAME ONLY COMMANDS ---------------
        const commandsWithUsername = [
            "demote", "promote", "unforceverify",
            "unverify", "exile", "groupban",
            "groupunban"
        ];

        if (commandsWithUsername.includes(interaction.commandName)) {
            if (focused.name === "username") {
                const user = await getRobloxUser(focusedValue);
                if (!user) return interaction.respond([]);

                return interaction.respond([
                    { name: `${user.username} (${user.id})`, value: user.username }
                ]);
            }
        }

        // --------------- VERIFY / FORCEVERIFY / NICK COMMANDS ---------------
        const nickCommands = ["verify", "forceverify", "setnick", "forcenick"];
        if (nickCommands.includes(interaction.commandName)) {
            const user = await getRobloxUser(focusedValue);
            if (!user) return interaction.respond([]);

            const info = await noblox.getUserInfo(user.id);

            if (interaction.options.get("nickname")) {
                return interaction.respond([
                    { name: "Display Name", value: info.displayName },
                    { name: "Smart Name", value: `${info.displayName} (@${user.username})` },
                    { name: "Username", value: user.username }
                ]);
            }

            return interaction.respond([
                { name: `${user.username} (${user.id})`, value: user.username }
            ]);
        }

        // default fail safe
        return interaction.respond([]);

    } catch (err) {
        console.error("Autocomplete error:", err);
        return interaction.respond([]);
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
              if (response) {
              await noblox.setCookie(response, interaction.guild.id)
              bot.user.setPresence({ activities: [{ name: `Watching ${bot.guilds.cache.size} servers!`, type: ActivityType.Watching }], status: 'dnd'})
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
              const RobloxGroup = await db.get(`ServerSetup_${interaction.guild.id}.groupid`);
              const RobloxShouts = await db.get(`LogsSetup_${interaction.guild.id}.shoutchannel`)
              let onShout = noblox.onShout(Number(RobloxGroup));
              if ((RobloxGroup && RobloxShouts)) {
              onShout.on('data', async function(post) {
                  const group = await noblox.getGroup(Number(RobloxGroup)).catch(() => {
                    return
                  })
                  if (!group) return
                  let groupName = group.name;
                if (!post.poster) return;
              let avatar = await noblox.getPlayerThumbnail(post.poster.userId, "48x48", "png", true, "headshot")
              let avatarurl = avatar[0].imageUrl;
              const shoutchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${RobloxShouts}`)
              const embed = new EmbedBuilder()
              .setTitle(`**Group Shout**`)
              .addFields(
                {
                  name: '**User:**',
                  value: `${post.poster.username}`,
                  inline: true
                },
                {
                  name: '**UserId:**',
                  value: `${post.poster.userId}`,
                  inline: true
                },
                {
                  name: '**Shout Message:**',
                  value: `${post.body || '""'}`,
                  inline: true
                },
                {
                  name: '**Links:**',
                  value: `[Group](https://www.roblox.com/groups/${RobloxGroup})\n[Profile](https://www.roblox.com/users/${post.poster.userId}/profile)`,
                  inline: true
                }
              )
              .setAuthor({ name: post.poster.username, iconURL: avatarurl })
              .setColor(`Green`)
              .setFooter({ text: groupName })
              .setTimestamp(Date.now())
              shoutchannel.send({ embeds: [embed] })
              
              }); 
               
              onShout.on('error', function (err) {
                 console.log(err)
              });
              }
              
              let RobloxCookie = await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)
              let ServerLogs = await db.get(`LogsSetup_${interaction.guild.id}.serverlogs`)
              let onAudit = noblox.onAuditLog(Number(RobloxGroup), RobloxCookie)
              if ((RobloxCookie && ServerLogs)) {
              onAudit.on('data', async function(data) {
                const group = await noblox.getGroup(Number(RobloxGroup)).catch(() => {
                  return
                });
                if (!group) return;
                let groupName = group.name;
                if (data.actionType === 'Ban Member') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) banned user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Unban Member') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) unbanned user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Remove Member') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) kicked user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Change Rank') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) changed user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s rank from ${data.description.OldRoleSetName} to ${data.description.NewRoleSetName}`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Post Status') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) changed the group shout to "${data.description.Text}"`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Configure Group Game') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) updated [**${data.description.TargetName}**](https://www.roblox.com/universes/configure?id=${data.description.TargetId}):`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Spend Group Funds') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
                      
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const Robux = bot.emojis.cache.get('1230810581779349504')
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) spent ${Robux}${data.description.Amount} of group funds for: ${data.description.ItemDescription}`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Delete Post') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) deleted post "${data.description.PostDesc}" by user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Delete Ally') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) removed group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId}) as an ally`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Send Ally Request') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) sent an ally request to group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Accept Ally Request') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
                      
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) accepted group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})'s ally request`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Decline Ally Request') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) declined group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})'s ally request`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Configure Badge') {
                  if (data.description.Type === 0) {
                    let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                    let avatarurl = avatar[0].imageUrl;
              
                    const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                    const embed = new EmbedBuilder()
                      .setTitle(`**Group Audit Logs**`)
                      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) enabled the badge [**${data.description.BadgeName}**](https://www.roblox.com/badges/${data.description.BadgeId})`)
                      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                      .setColor(`Red`)
                      .setFooter({ text: groupName })
                      .setTimestamp(Date.now())
                    logchannel.send({ embeds: [embed] })
                  } else if (data.description.Type === 1) {
                    let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                    let avatarurl = avatar[0].imageUrl;
              
                    const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                    const embed = new EmbedBuilder()
                      .setTitle(`**Group Audit Logs**`)
                      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) disabled the badge [**${data.description.BadgeName}**](https://www.roblox.com/badges/${data.description.BadgeId})`)
                      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                      .setColor(`Red`)
                      .setFooter({ text: groupName })
                      .setTimestamp(Date.now())
                    logchannel.send({ embeds: [embed] })
                  }
                } else if (data.actionType === 'Create Items') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created the group item [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Create Group Asset') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created asset [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Update Group Asset') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created new version ${data.description.VersionNumber} of asset [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Accept Join Request') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) accepted user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s join request`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Decline Join Request') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) declined user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s join request`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Leave Group') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) left`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                } else if (data.actionType === 'Join Group') {
                  let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
                  let avatarurl = avatar[0].imageUrl;
              
                  const logchannel = bot.guilds.cache.get(`${interaction.guild.id}`).channels.cache.get(`${ServerLogs}`)
              
                  const embed = new EmbedBuilder()
                    .setTitle(`**Group Audit Logs**`)
                    .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) joined`)
                    .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
                    .setColor(`Red`)
                    .setFooter({ text: groupName })
                    .setTimestamp(Date.now())
                  logchannel.send({ embeds: [embed] })
                }
              })
              
              onAudit.on('error', function(err) {
                  return;
              })
              }
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