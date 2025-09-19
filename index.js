const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

require('dotenv').config()

//Datastore
const { QuickDB } = require("quick.db");
const db = new QuickDB();
//Roblox
const noblox = require('noblox.js')
// Custom console logging
const { Logger } = require("@hammerhq/logger");
const pogger = new Logger();
// Express Webserver
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
// Syncronously read content from files
const { readdirSync } = require('fs');

const { SoundcloudExtractor } = require('discord-player-soundcloud');

 const { registerExtractors, initPlayer } = require("./utils/registerExtractors");

const bot = new Client({ 
  intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.DirectMessages,
],
  partials: [
    Partials.GuildMember
  ]
})

// Separate all Command files from an array.
bot.commands = new Map()

// Slash commands
bot.slashcommands = []

// Find all command files that end in .js for Javascript files only. Change this to whatever code language you are making the bot in.
const commands = readdirSync('./Commands').filter(file => 
    file.endsWith('.js')
)

// Removes case sensitivity of the files by always returning the name as lowercase and pushes the slash commands into the array.
for (const command of commands) {
    const file = require(`./Commands/${command}`)
    bot.commands.set(file.name.toLowerCase(), file)
    if (file.data) {
        bot.slashcommands.push(file.data)
    }
}

const events = readdirSync('./Events')
// Reads our Events folder with the files for event functions.
for (const event of events) {
    const file = require(`./Events/${event}`)
    const name = event.split('.')[0]

    bot.on(name, file.execute.bind(null, bot))
}
// Executes our Event files.

bot.on('ready', async() => {
  const player = await initPlayer(bot);
    bot.player = player
    await registerExtractors(player);
    bot.player.extractors.register(SoundcloudExtractor)

  bot.on('interactionCreate', async(interaction) => {
          // Beginning of Auto-Complete
                if (interaction.isAutocomplete()) {
      const serverData = await db.get(`ServerSetup_${interaction.guild.id}`)
      const serverSettings = await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`) && await db.get(`ServerSetup_${interaction.guild.id}.groupid`) && await db.get(`ServerSetup_${interaction.guild.id}.minrank`)
      if (!(serverData && serverSettings)) return;
      try {
      const RobloxGroup = serverData.groupid
      const RobloxCookie = serverData.rblxcookie
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
          const filtered = grouproles.filter((role) => role.name.toLowerCase().startsWith(focusedValue.toLowerCase()) &&
          !values.includes(role.name) &&
          role.id !== botrole.id
          );               
          if (filtered) {
          await interaction.respond(
              filtered.slice(0, 25).map(role => ({ name: role.name, value: role.name })),
          );
          }
        }
      }
    
      if (focusedOption.name === 'username') {
          const focusedValue = focusedOption.value;
          fetch(`https://www.roblox.com/users/profile?username=${focusedValue}`).then(r => {if (!r.ok) { return; }
          if (r.status != 200) { return; }
          if (r.status == 429) { return; }
          return r.url.match(/\d+/)[0];
      }).then(async id => {
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
      fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
      if (r.status != 200) { return; }
      if (r.status == 429) { return; }
      return r.url.match(/\d+/)[0];
    }).then(async id => {
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
      fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
      if (r.status != 200) { return; }
      if (r.status == 429) { return; }
      return r.url.match(/\d+/)[0];
    }).then(async id => {
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
      fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
      if (r.status != 200) { return; }
      if (r.status == 429) { return; }
      return r.url.match(/\d+/)[0];
    }).then(async id => {
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
      fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
      if (r.status != 200) { return; }
      if (r.status == 429) { return; }
      return r.url.match(/\d+/)[0];
    }).then(async id => {
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
    
    if (interaction.commandName === 'setnick') {
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
      fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
      if (r.status != 200) { return; }
      if (r.status == 429) { return; }
      return r.url.match(/\d+/)[0];
    }).then(async id => {
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
        fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
        if (r.status != 200) { return; }
        if (r.status == 429) { return; }
        return r.url.match(/\d+/)[0];
      }).then(async id => {
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
    
      if (interaction.commandName === 'groupunban') {
    
        if (interaction.options.get('username')) {
          const name = await interaction.options.get('username').value
          fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
          if (r.status != 200) { return; }
          if (r.status == 429) { return; }
          return r.url.match(/\d+/)[0];
        }).then(async id => {
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
    // End of Auto-Complete
              // Beginning of Modals
          if (interaction.isButton()) { // If the interaction contains a button continue.
          // Handle different button IDs
          console.log('Button was pressed')
          if (interaction.customId === 'claim') { // If the button ID is claim continue.
          
            if (interaction.member.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.Administrator])) { // If the member clicking the button has any of these permissions continue.
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
           }).then(async () => {
            await interaction.channel.delete().catch(() => {
              return;
            })
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
        // End of Buttons
  
        function containsNumber(str) {
          return /^\d+$/.test(str);
      }
        // Beginning of Modal Submissions
          if (interaction.type === InteractionType.ModalSubmit) { // If a form modal was submitted do something.
  
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
                if (!interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) return interaction.editReply(`:x: **ERROR** | You don't have permission to Approve this application!`)
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
               if (!interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) return interaction.editReply(`:x: **ERROR** | You don't have permission to Deny this application!`).then(msg => { setTimeout(() => { msg.deleteReply().catch(() => { return; })}, 10000)})
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
              const RobloxCookie = db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)
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
  })

  const guilds = [...bot.guilds.cache.values()]; // turn cache into an array

// Map each guild to a Promise that resolves with either the guild data or null
const results = await Promise.all(
    guilds.map(async (guild) => {
        const [RobloxCookie, Group, MinRank] = await Promise.all([
            db.get(`ServerSetup_${guild.id}.rblxcookie`),
            db.get(`ServerSetup_${guild.id}.groupid`),
            db.get(`ServerSetup_${guild.id}.minrank`)
        ]);

        if (RobloxCookie && Group && MinRank) {
            return { guild, RobloxCookie, Group, MinRank };
        }
        return null; // not valid
    })
);

// Filter out null results
const validGuilds = results.filter(Boolean);
// Now process only the valid guilds
for (const { guild, RobloxCookie, Group, MinRank } of validGuilds) {
  if (RobloxCookie && Group) {
        await noblox.setCookie(RobloxCookie, guild.id) // Log Roblox Bot in.
    .then(async(success) => { // Required if the group's shout is private
        console.log(`${(await noblox.getAuthenticatedUser()).name} Logged in.`);
      
    console.log(`${bot.user.username} is Running`)
    bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
      
    // Fetch data and auto-populate command options.
//----------------------------------------Roblox Group Logs---------------------------------------------------------------------------------------------------------------------------

const RobloxGroup = await db.get(`ServerSetup_${guild.id}.groupid`);
const RobloxShouts = await db.get(`LogsSetup_${guild.id}.shoutchannel`)
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
const shoutchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${RobloxShouts}`)
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


let RobloxCookie = await db.get(`ServerSetup_${guild.id}.rblxcookie`)
let ServerLogs = await db.get(`LogsSetup_${guild.id}.serverlogs`)
if (!(RobloxCookie && ServerLogs)) return;
let onAudit = noblox.onAuditLog(Number(RobloxGroup), RobloxCookie)
onAudit.on('data', async function(data) {
  const group = await noblox.getGroup(Number(RobloxGroup)).catch(() => {
    return
  });
  if (!group) return;
  let groupName = group.name;

    if (data.actionType === 'Ban Member') {
      let avatar = await noblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
      let avatarurl = avatar[0].imageUrl;

      const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

      const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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


        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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
        

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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
        

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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
        

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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
        

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

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

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) declined user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s join request`)
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

    }).catch(function(error) {
      console.log(error)
    })

    app.get("/verify", async (req, res) => {
      try {
          const User = req.query.userid;
          const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await noblox.getPlaceInfo([PlaceId]).catch((error) => {
            console.log(error)
          })
         
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await noblox.getGroupGames(RobloxGroup, "PUBLIC");
          let responseData;
          let found = false;
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
                  if (parseInt(User) && matchesId === true) {
                      await guild.members.fetch();
                      const member = guild.members.cache.find(async m => {
                          const DiscordUser = await db.get(`Verification_${guild.id}_${parseInt(User)}.discordid`);
                          return DiscordUser;
                      });

                      if (member) {
                          const RobloxUser = await db.get(`Verification_${guild.id}_${parseInt(User)}.robloxid`);
                          const DiscordUser = await db.get(`Verification_${guild.id}_${parseInt(User)}.discordid`);
                          const user = await guild.members.fetch(DiscordUser);
    
                          if (DiscordUser && RobloxUser && user && user.user) {
                              responseData = { RobloxUser: RobloxUser, DiscordUser: user.user.username, DiscordId: user.user.id };
                              found = true;
                          }
                          if (found && !responseSent) {
                            responseSent = true;
                            res.json(responseData);
                          }
                      }
                      if (!responseSent) {
                        res.send('Something went wrong!');
                        responseSent = true;
                    }
                  } else {
                    res.statusMessage = "Unauthorized | You don't have permission to send this request!";
                    res.status(401).json();
                    responseSent = true;
                  }
    
      } catch (error) {
          console.log(`Error in processing request: ${error.message}`);
          res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get("/application", async (req, res) => {
      try {
        const User = req.query.userid;
        const Questions = req.query.questions;
        const Answers = req.query.answers;
        const QuestionsArray = JSON.parse(Questions)
        const AnswersArray = JSON.parse(Answers)
        const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await noblox.getPlaceInfo([PlaceId]).catch(function(error) {
            console.log(error)
          })
          
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await noblox.getGroupGames(RobloxGroup, "PUBLIC");
          let responseData;
          let found = false;
        
          let responseSent = false; // Flag to track whether response has been sent

          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)

          if (parseInt(User) && Questions && Answers && matchesId === true) {
            const RobloxUser = await noblox.getUserInfo(parseInt(User))
            const RobloxId = await noblox.getIdFromUsername(RobloxUser.username)
            let avatar = await noblox.getPlayerThumbnail(RobloxId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)
            const embed = new EmbedBuilder()
        .setTitle(`**YT Mod Application Results!**`)
        .setDescription(`Please review ${RobloxUser.name}'s Application for YT Mod!`)
        .addFields(
          {
            name: `**1.** ${QuestionsArray[0][0]}`,
            value: `**Answer:** ${AnswersArray[0]}`,
            inline: true
          },
          {
            name: `**2.** ${QuestionsArray[1][0]}`,
            value: `**Answer:** ${AnswersArray[1]}`,
            inline: true
          },
          {
            name: `**3.** ${QuestionsArray[2][0]}`,
            value: `**Answer:** ${AnswersArray[2]}`,
            inline: true
          },
          {
            name: `**4.** ${QuestionsArray[3][0]}`,
            value: `**Answer:** ${AnswersArray[3]}`,
            inline: true
          },
          {
            name: `**5.** ${QuestionsArray[4][0]}`,
            value: `**Answer:** ${AnswersArray[4]}`,
            inline: true
          },
        )
        .setAuthor({ name: `${RobloxUser.displayName}\n${RobloxUser.name}`, iconURL: avatarurl})
        .setColor(`Green`)
        .setFooter({ text: 'Money Developers' })
        .setTimestamp(Date.now())
        
        logchannel.send({ embeds: [embed], components: [ new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId('approve').setLabel('Approve').setEmoji('✅').setStyle(ButtonStyle.Success)).addComponents( new ButtonBuilder().setCustomId('deny').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger)) ] })
        res.status(200).json();
        responseSent = true;
          } else {
            res.statusMessage = "Unauthorized | You don't have permission to send this request!";
                  res.status(401).json();
                  responseSent = true;
          }
      } catch (error) {
        console.log(`Error in processing request: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    app.use(bodyParser.urlencoded({ extended: true }));
    
      app.post("/confirm", async(req, res) => {
        try {
          const User = req.body.userId;
          const DiscordId = req.body.discordId;
          const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await noblox.getPlaceInfo([PlaceId]).catch(function(error) {
            console.log(error)
          });
         
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await noblox.getGroupGames(RobloxGroup, "PUBLIC");
          let found = false;
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (parseInt(User) && parseInt(DiscordId) && matchesId === true) {
                    await guild.members.fetch();
                      const member = guild.members.cache.find(async () => {
                          const DiscordUser = await db.get(`Verification_${guild.id}_${parseInt(User)}.discordid`);
                          return DiscordUser;
                      });
                  if (member) {
                    const RobloxUser = await db.get(`Verification_${guild.id}_${parseInt(User)}.robloxid`);
                    const DiscordUser = await db.get(`Verification_${guild.id}_${parseInt(User)}.discordid`);
                          const user = await guild.members.fetch(DiscordUser);
    
                      if (RobloxUser && user && user.user && user.user.id == DiscordId) {
                        const nickname = await db.get(`Verification_${guild.id}_${parseInt(User)}.discordnick`);
                        let findRole3 = "Verified"
          const role3 = await guild.roles.cache.find(r => r.name.includes(findRole3))
          if (!user.roles.cache.has(role3.id)) {
    
          let robloxname = await noblox.getUsernameFromId(parseInt(User))
           
            await db.set(`RobloxInfo_${guild.id}_${user.user.id}`, { discordid: user.user.id, robloxid: User, robloxusername: robloxname });
          let rank = await noblox.getRankInGroup(RobloxGroup, User)
          let role1 = await noblox.getRole(RobloxGroup, rank)
          let findRole = "Verified"
          let findRole2 = role1.name
          const role = await guild.roles.cache.find(r => r.name.includes(findRole))
          const role2 = await guild.roles.cache.find(r => r.name.includes(findRole2))
          
          const botHighestRole = guild.members.me.roles.highest;
          
          if (nickname) {
          
          user.setNickname(nickname[0])
          }
                        found = true
                  if (found && !responseSent) {
                    // After processing, send a response back to Roblox
                    res.json({ success: true, message: 'success' });
                     responseSent = true;
                  }

                  if (user && role && role2) {
            const rolesToAdd = [];
        
            // Check if the member already has the roles
            if (!user.roles.cache.has(role.id)) {
                if (role.position < botHighestRole.position) {
                    rolesToAdd.push(role.id);
                }
            }
        
            if (!user.roles.cache.has(role2.id)) {
                if (role2.position < botHighestRole.position) {
                    rolesToAdd.push(role2.id);
                }
            }
        
            // Add roles if there are any to add
            if (rolesToAdd.length > 0) {
                await user.roles.add(rolesToAdd);
            }
        }
                    } else {
                      res.json({ success: false, message: 'Verification failed' });
                      responseSent = true;
                    }
                  }
              }
            } else {
              res.statusMessage = "Unauthorized | You don't have permission to send this request!";
              res.status(401).json();
              responseSent = true;
            }
        } catch(error) {
          console.error(`Error in processing request: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
        }
      })   
    
      app.get("/ranker", async(req, res) => {
        try {
          const User = req.query.userid;
          const Rank = req.query.rank;
          const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await noblox.getPlaceInfo([PlaceId]).catch(function(error) {
            console.log(error)
          });
         
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await noblox.getGroupGames(RobloxGroup, "PUBLIC");
    

          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
            if (parseInt(User) && matchesId === true) {
                    const rank = await noblox.getRankInGroup(RobloxGroup, User);
                    const role = await noblox.getRole(RobloxGroup, rank);
                    let newrole = await noblox.getRole(RobloxGroup, parseInt(Rank));
                    const groupbot = (await noblox.getAuthenticatedUser()).id;
                    const botrank = await noblox.getRankInGroup(RobloxGroup, groupbot);
                    const botrole = await noblox.getRole(RobloxGroup, botrank);
                    
                    if ((role.rank) <= (botrole.rank) && (role.rank) >= 1) {
                        await noblox.setRank(RobloxGroup, parseInt(User), parseInt(newrole.rank)).catch(() => {
                          return;
                        })
                        res.status(200).json();
                        responseSent = true;
                    }
            } else {
              res.statusMessage = "Unauthorized | You don't have permission to send this request!";
                    res.status(401).json();
                    responseSent = true;
            }
        } catch(error) {
          console.error(`Error in processing request: ${error.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    app.get("/promote", async(req, res) => {
      try {
        const User = req.query.userid;
        const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await noblox.getPlaceInfo([PlaceId])
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await noblox.getGroupGames(RobloxGroup, "PUBLIC");
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (parseInt(User) && matchesId === true) {
        const rank = await noblox.getRankInGroup(RobloxGroup, parseInt(User));
        const role = await noblox.getRole(RobloxGroup, rank);
        let newrank = role.rank + 1;
        let newrole = await noblox.getRole(RobloxGroup, newrank);
        const groupbot = (await noblox.getAuthenticatedUser()).id;
        const botrank = await noblox.getRankInGroup(RobloxGroup, groupbot);
        const botrole = await noblox.getRole(RobloxGroup, botrank);
        if ((newrole.rank) < (botrole.rank)) {
        await noblox.promote(RobloxGroup, parseInt(User)).catch(() => {
          return;
        })
        res.status(200).json();
        responseSent = true;
        }
                } else {
                  res.statusMessage = "Unauthorized | You don't have permission to send this request!"
                 res.status(401).json();
                 responseSent = true;
                }
      } catch(error) {
        console.error(`Error in processing request: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    app.get("/demote", async(req, res) => {
      try {
        const User = req.query.userid;
        const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await noblox.getPlaceInfo([PlaceId])
         
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await noblox.getGroupGames(RobloxGroup, "PUBLIC");
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (parseInt(User) && matchesId === true) {
                      const rank = await noblox.getRankInGroup(RobloxGroup, parseInt(User));
                      const role = await noblox.getRole(RobloxGroup, rank);
                      let newrank = role.rank - 1;
                      let newrole = await noblox.getRole(RobloxGroup, newrank);
                    if ((newrole.rank) >= 1){
                      await noblox.demote(RobloxGroup, parseInt(User)).catch(() => {
                        return;
                      })
                      res.status(200).json();
                      responseSent = true;
                    }
            } else {
              res.statusMessage = "Unauthorized | You don't have permission to send this request!"
                 res.status(401).json();
                 responseSent = true;
            }
      } catch(error) {
        console.error(`Error in processing request: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get("/", async(req, res) => {
      res.status(500).json({ error: 'Internal Server Error' })
    })
    
    app.get("/shouts", async(req, res) => {
      try {
        const Message = req.query.shout;
        const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await noblox.getPlaceInfo([PlaceId])
          
          const RobloxGroup = PlaceInfo[0].builderId;
          if (Group.includes(RobloxGroup)) {
           
            await noblox.setCookie(RobloxCookie, false, guild)
          const groupgames = await noblox.getGroupGames(RobloxGroup, "PUBLIC");

          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (matchesId === true) {
                      await noblox.shout(RobloxGroup, Message)
                      res.status(200).json();
                      responseSent = true
              } else {
                res.statusMessage = "Unauthorized | You don't have permission to send this request!"
                 res.status(401).json();
                 responseSent = true;
              }
            }
      } catch(error) {
        console.error(`Error in processing request: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }
//-----------------------------------------------End of Roblox Group Logs---------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------Roblox Group Join and Leave Logs-------------------------------------------------------------------------------------------------------------------------
// Initialize the previous member count to 0
let previousCount = null;
const RobloxGroup = await db.get(`ServerSetup_${guild.id}.groupid`);
const ServerLogs = await db.get(`LogsSetup_${guild.id}.serverlogs`);

if (ServerLogs && RobloxGroup) {
  async function fetchMemberData() {
    try {
      const response = await fetch(`https://groups.roblox.com/v1/groups/${RobloxGroup}`)
      if (!response.ok) return;
      const data = await response.json();
      return data.memberCount || 0;
    } catch (err) {
      console.error("fetchMemberData error:", err.message);
    }
  }

  async function fetchMostRecentMember() {
    try {
      const roles = await fetch(`https://groups.roblox.com/v1/groups/${RobloxGroup}/roles`)
      if (!roles.ok) return;
      const roledata = await roles.json();
      const rolesetId = roledata.roles[1]
      const roleId = rolesetId.id
      const response = await fetch(`https://groups.roblox.com/v1/groups/${RobloxGroup}/roles/${roleId}/users?sortOrder=Desc`);
      if (!response.ok) return;
      const data = await response.json();
      const mostRecentMember = data.data[0];
      const userId = mostRecentMember.userId;
      if (!userId) return null;

      const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      if (!userResponse.ok) return;
      const userData = await userResponse.json();
      return {
        id: userData.id,
        name: userData.name,
        displayName: userData.displayName,
      };
    } catch (err) {
      console.error("fetchMostRecentMember error:", err.message);
      return null;
    }
  }

  async function checkMemberCount() {
    try {
       const currentCount = await fetchMemberData();

      //if (previousCount === null) return;
      if (currentCount > previousCount) {
         await new Promise(r => setTimeout(r, 2000)); // wait 2s
        const currentMember = await fetchMostRecentMember();
        if (!currentMember) return;

        const group = await noblox.getGroup(RobloxGroup).catch(err => console.error(err.message));
        if (!group) return;

        const groupName = group.name;
        const avatar = await noblox.getPlayerThumbnail(currentMember.id, "48x48", "png", true, "headshot");
        const avatarUrl = avatar[0].imageUrl || '';

        const logchannel = bot.guilds.cache.get(guild.id).channels.cache.get(ServerLogs);
        if (!logchannel) return;

        const embed = new EmbedBuilder()
          .setTitle("**Group Member Joined!**")
          .addFields(
            { name: "**User:**", value: currentMember.name, inline: true },
            { name: "**UserId:**", value: `${currentMember.id}\n**Joined the Roblox Group!**`, inline: true },
            { name: "**Links:**", value: `[Group](https://www.roblox.com/groups/${RobloxGroup})\n[Profile](https://www.roblox.com/users/${currentMember.id}/profile)`, inline: true }
          )
          .setAuthor({ name: currentMember.name, iconURL: avatarUrl })
          .setColor("Blue")
          .setFooter({ text: groupName })
          .setTimestamp(Date.now());

        await logchannel.send({ embeds: [embed] });

        if (
          currentMember.name.toLowerCase().includes("money") ||
          currentMember.displayName.toLowerCase().includes("money")
        ) {
          await noblox.exile(RobloxGroup, currentMember.id);
        }
      } else if (currentCount < previousCount) {
        const group = await noblox.getGroup(RobloxGroup).catch(err => console.error(err));
        if (!group) return;

        const groupName = group.name;
        const logchannel = bot.guilds.cache.get(guild.id).channels.cache.get(ServerLogs);
        if (!logchannel) return;

        const embed = new EmbedBuilder()
          .setTitle("**Group Member Left!**")
          .setDescription("**A Group member has left the Group!**")
          .setColor("Red")
          .setFooter({ text: groupName })
          .setTimestamp(Date.now());

        await logchannel.send({ embeds: [embed] });
      }

      previousCount = currentCount;
    } catch (err) {
      console.error("checkMemberCount error:", err.message);
      return 0;
    }
  }

  // Setup shortPoll
noblox.shortPoll({
  getLatest: async (latest) => {
    try {
    const currentCount = await fetchMemberData().catch((err) => {
      return;
    })
    const given = [];
    // Only run on updates, not on the first poll
 if (latest !== -1 && currentCount !== latest) {
  try {
  await checkMemberCount()
  } catch (err) {
    console.error("checkMemberCount failed:", err.message);
  }
  given.push(currentCount);
}

    return {
      latest: latest, // update latest for next cycle
      data: given
    };
  } catch (err) {
    console.error("shortPoll error in getLatest:", err);
    return { latest, data: [] };
  }
  },
  delay: 30000,
  timeout: -1 // This is to prevent shortpolling from timing out!
});

let currentUser = (await noblox.getAuthenticatedUser()).name;
 console.log(currentUser);
}
  }

  app.listen(port, () =>
pogger.success(`[SERVER]`, `Server is Ready!`, ` App Listening to: https://localhost:${port}`)
)
})



bot.login(process.env.Token)