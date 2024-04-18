// Discord Variables
const { Client, GatewayIntentBits, Partials, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, PermissionsBitField } = require('discord.js');
var prefix = "!";
require('dotenv').config();
// Discord Intents
const bot = new Client({ 
  intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildMessageReactions,
],
  partials: [
    Partials.GuildMember
  ]
});
// Quick Database
bot.db = require('quick.db');
// Chat GPT
const openai = require("../bot/utils/openAi");
// Separate all Command files from an array.
bot.commands = new Map()

// Discord Music player
const { Player } = require('discord-player');
// Discord player settings
bot.player = new Player(bot, {
  leaveOnEnd: false,
  leaveOnStop: false,
  leaveOnEmpty: true,
  leaveOnEndCooldown: 1000,
  leaveOnEmptyCooldown: 1000,
  autoSelfDeaf: true, // This doesn't really matter. It's just a prefrence to make the bot look like it can't hear.
 ytdlOptions: {
    quality: "highest", // Keep this as highest as it will make the music play 99% better.
    filter: "audioonly", // Only play audio files we don't need videos.
    highWaterMark: 1 << 25, 
    dlChunkSize: 0, 
  },
  initialVolume: 100,
  bufferingTimeout: 30,
  spotifyBridge: true, // Tap into spotify to play music without needing to be logged in.
  disableVolume: false, // Don't make this true. If you do the bot will look like it is playing but there won't be sound.
  volumeSmoothness: 0.08 // Adjust this to make it as smooth as you want to your liking.
})

// Roblox Variables
const rbxbot = require('noblox.js');

// Syncronously read content from files
const { readdirSync } = require('fs');

// Express Webserver
const express = require('express');
const app = express();
const port = 80;
const axios = require('axios');
const bodyParser = require('body-parser');

// Custom console logging
const pogger = require('pogger');
const colors = require('colors');

// Milliseconds converter
const ms = require('ms');
const Time = ms('5m');

bot.slashcommands = []
// Turn all slash commands into an array so we can iterate over each one at a time.

const commands = readdirSync('./Commands').filter(file => 
    file.endsWith('.js')
)
// Find all command files that end in .js for Javascript files only. Change this to whatever code language you are making the bot in.

for (command of commands) {
    const file = require(`./Commands/${command}`)
    bot.commands.set(file.name.toLowerCase(), file)
    if (file.data) {
      
        bot.slashcommands.push(file.data)
    }
}
// Removes case sensitivity of the files by always returning the name as lowercase and pushes the slash commands into the array.

const events = readdirSync('./Events')
// Reads our Events folder with the files for event functions.

for (const event of events) {
    const file = require(`./Events/${event}`)
    const name = event.split('.')[0]

    bot.on(name, file.execute.bind(null, bot))
}
// Executes our Event files.


// Beginning of Bot code!
bot.on('ready', async() => {
  // Bot is logged in and ready to run commands.

// Anti-Spam
const usersMap = new Map();
const LIMIT = 5;
const DIFF = 120000; //milliseconds
bot.on('messageCreate', async (message) => {
  if (message.author.id === bot.user.id) return;

  try {
  if(usersMap.has(message.author.id)) {
    const userData = usersMap.get(message.author.id);
    const { lastMessage, timer } = userData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let msgCount = userData.msgCount;
    let attempts = bot.db.get(`attempts_${message.guild.id}_${message.author.id}`);
    
    if(difference > DIFF) {
        clearTimeout(timer);
        console.log('Cleared Timeout');
        userData.msgCount = 1;
        userData.lastMessage = message;
        userData.timer = setTimeout(() => {
            usersMap.delete(message.author.id)
            console.log('Removed from map.')
        }, 5000);
        usersMap.set(message.author.id, userData)
    } else {
      ++msgCount;
      let reason = "[AutoMod] Spamming isn't allowed!";
      let member = message.guild.members.cache.get(message.author.id);
      if (message.member.permissions.has('ModerateMembers' || 'BanMembers' || 'KickMembers' || 'Administrator')) return;
      if (attempts <= 3 && member.moderatable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          bot.db.set(`userWarnings_${message.guild.id}_${message.author.id}.userid`, message.author.id);
          bot.db.add(`userWarnings_${message.guild.id}_${message.author.id}.warnings`, 1);
          bot.db.push(`userWarnings_${message.guild.id}_${message.author.id}.reasons`, reason);
          let embed = new EmbedBuilder()
              .setColor("Yellow")
              .setTitle(`**Moderation Report**`)
              .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
              .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
              .addFields(
                {
                  name: '**Username:**',
                  value: `${message.author.username}`,
                  inline: true
                },
                {
                  name: '**Discriminator:**',
                  value: `${message.author.discriminator}`,
                  inline: true
                },
                {
                  name: '**User Tag:**',
                  value: `${message.author.tag}`,
                  inline: true
                },
                {
                  name: '**User Mention:**',
                  value: `${message.author}`,
                  inline: true
                },
                {
                  name: '**UserId:**',
                  value: `${message.author.id}`,
                  inline: true
                },
                {
                  name: '**Moderation Type:**',
                  value: 'Warn',
                  inline: true
                },
                {
                  name: '**Reason:**',
                  value: `${reason}`,
                  inline: true
                },
                {
                  name: '**Moderator:**',
                  value: `${bot.user.username}`,
                  inline: true
                }
              )
              .setTimestamp(Date.now());
      
          // Fetch the spamming user's messages and bulk delete them
          message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
              const userMessages = messages.filter(msg => msg.author.id === message.author.id);
              Promise.all([
              message.channel.bulkDelete(userMessages).catch(console.error),
              message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(() => {
                        return;
                    });
                }, 5000);
            })
          ])
          }).catch(console.error)
        } else if (attempts == 4 && member.moderatable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          reason = "[AutoMod] Timed out for Spamming! Duration: 1 Minute!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Timeout',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now()); 
          
         // Fetch the spamming user's messages and bulk delete them
         message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
          const userMessages = messages.filter(msg => msg.author.id === message.author.id);
          Promise.all([
          member.timeout(60000, reason),
          message.channel.bulkDelete(userMessages).catch(console.error),
          message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
              msg.delete().catch(() => {
                return;
              })
          }, 5000)
        })
      ])
      }).catch(console.error);      
        } else if (attempts == 5 && member.moderatable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          reason = "[AutoMod] Timed out for Spamming! Duration: 5 Minutes!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Timeout',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now());
          
          // Fetch the spamming user's messages and bulk delete them
         message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
          const userMessages = messages.filter(msg => msg.author.id === message.author.id);
          Promise.all([
          member.timeout(300000, reason),
          message.channel.bulkDelete(userMessages).catch(console.error),
          message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
              msg.delete().catch(() => {
                return;
              })
          }, 5000)
        })
      ])
      }).catch(console.error);     
        } else if (attempts == 6 && member.moderatable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          reason = "[AutoMod] Timed out for Spamming! Duration: 10 Minutes!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Timeout',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now());
          
          // Fetch the spamming user's messages and bulk delete them
         message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
          const userMessages = messages.filter(msg => msg.author.id === message.author.id);
          Promise.all([
          member.timeout(600000, reason),
          message.channel.bulkDelete(userMessages).catch(console.error),
          message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
              msg.delete().catch(() => {
                return;
              })
          }, 5000)
        })
      ])
      }).catch(console.error);     
        } else if (attempts == 7 && member.moderatable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          reason = "[AutoMod] Timed out for Spamming! Duration: 1 Hour!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Timeout',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now());
                   
          // Fetch the spamming user's messages and bulk delete them
         message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
          const userMessages = messages.filter(msg => msg.author.id === message.author.id);
          Promise.all([
          member.timeout(3600000, reason),
          message.channel.bulkDelete(userMessages).catch(console.error),
          message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
              msg.delete().catch(() => {
                return;
              })
          }, 5000)
        })
      ])
      }).catch(console.error);     
        } else if (attempts == 8 && member.moderatable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          reason = "[AutoMod] Timed out for Spamming! Duration: 1 Day!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Timeout',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now());
                  
          // Fetch the spamming user's messages and bulk delete them
         message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
          const userMessages = messages.filter(msg => msg.author.id === message.author.id);
          Promise.all([
          member.timeout(86400000, reason),
          message.channel.bulkDelete(userMessages).catch(console.error),
          message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
              msg.delete().catch(() => {
                return;
              })
          }, 5000)
        })
      ])
      }).catch(console.error);     
        } else if (attempts == 9 && member.moderatable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          reason = "[AutoMod] Timed out for Spamming! Duration: 1 Week!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Timeout',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now());
                  
         // Fetch the spamming user's messages and bulk delete them
         message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
          const userMessages = messages.filter(msg => msg.author.id === message.author.id);
          Promise.all([
          member.timeout(604800000, reason),
          message.channel.bulkDelete(userMessages).catch(console.error),
          message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
              msg.delete().catch(() => {
                return;
              })
          }, 5000)
        })
      ])
      }).catch(console.error);     
        } else if (attempts == 10 && member.kickable && parseInt(msgCount) === LIMIT) {
          bot.db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
          reason = "[AutoMod] Kicked for Spamming!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Kick',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now());
                  
                Promise.all([
          member.send({ embeds: [embed] }),
          message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
              msg.delete().catch(() => {
                return;
              })
          }, 5000)
        }),
          member.kick(reason)
              ])
          // Fetch the spamming user's messages and bulk delete them
         message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
          const userMessages = messages.filter(msg => msg.author.id === message.author.id);
          message.channel.bulkDelete(userMessages).catch(console.error);
      }).catch(console.error);     
        } else if (attempts == 11 && member.bannable && parseInt(msgCount) === LIMIT) {
          message.channel.bulkDelete(LIMIT);
          bot.db.delete(`attempts_${message.guild.id}_${message.author.id}`)
          reason = "[AutoMod] Banned for Spamming!"
          let embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle(`**Moderation Report**`)
                  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setFooter({ text: `${bot.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: bot.user.displayAvatarURL() })
                  .addFields(
                    {
                      name: '**Username:**',
                      value: `${message.author.username}`,
                      inline: true
                    },
                    {
                      name: '**Discriminator:**',
                      value: `${message.author.discriminator}`,
                      inline: true
                    },
                    {
                      name: '**User Tag:**',
                      value: `${message.author.tag}`,
                      inline: true
                    },
                    {
                      name: '**User Mention:**',
                      value: `${message.author}`,
                      inline: true
                    },
                    {
                      name: '**UserId:**',
                      value: `${message.author.id}`,
                      inline: true
                    },
                    {
                      name: '**Moderation Type:**',
                      value: 'Ban',
                      inline: true
                    },
                    {
                      name: '**Reason:**',
                      value: `${reason}`,
                      inline: true
                    },
                    {
                      name: '**Moderator:**',
                      value: `${bot.user.username}`,
                      inline: true
                    }
                  )
                  .setTimestamp(Date.now());
                  
                Promise.all([
                  message.channel.send({ embeds: [embed] }).then(msg => {
                    setTimeout(() => {
                      msg.delete().catch(() => {
                        return;
                      })
                  }, 5000)
                }),
          member.send({ embeds: [embed] }),
          member.ban({ deleteMessageSeconds: 60 * 60, reason: reason })
              ])
        } else {
          userData.msgCount = msgCount;
          usersMap.set(message.author.id, userData);
      }
  }
} else {
    let fn = setTimeout(() => {
        usersMap.delete(message.author.id)
    }, 5000);
    usersMap.set(message.author.id, {
        msgCount: 1,
        lastMessage : message,
        timer : fn
    });
}
  } catch(err) {
    console.log(err.message);
  }
})
// End of Anti-Spam.

// Update Bot's status showing the current number of guilds the bot is in.
  bot.on('guildMemberAdd', async (member) => {
    // Check if the new member is your bot by comparing user IDs
    if (member.user.id === bot.user.id) {

      bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    }
  });

  bot.on('guildMemberRemove', (member) => {
    // Check if the removed member is your bot by comparing user IDs
    if (member.user.id === bot.user.id) {

      bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    }
  });
  // End of Bot Status.

  // Suggestions
    bot.on('messageCreate', async (message) => {
      // If someone sends a message run the code below.
      let suggestionchannel = bot.db.get(`LogsSetup_${message.guild.id}.suggestionchannel`)
      if (suggestionchannel) {
        // If the message was sent in the Suggestion channel continue with the code.
        if (message.author.id === bot.user.id) return; // If the sender of the message is the bot stop at this line.
        if (message.channel.id === `${suggestionchannel}`) { // If the sender sends the message in the correct channel continue the function.
          try {
            await message.delete().catch(() => {
              return;
            })
            // Delete the user's message because we are going to convert it into an Embed.
            const embed = new EmbedBuilder()
              .setTitle(`**New Suggestion!**`)
              .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
              .setColor(`Blue`)
              .setDescription(`${message.content}`)
              .setFooter({ text: message.guild.name })
              .setTimestamp(Date.now());
      
            const sendMessage = await message.channel.send({ embeds: [embed] });
            
            if (sendMessage) {
            await sendMessage.react(`✅`);
            await sendMessage.react(`❌`);
            }
          } catch (err) {
            console.log(err.message);
          }
        }
      }
      });

    // Embed Buttons
      bot.on('interactionCreate', async interaction => {
        try {
        if (interaction.isButton()) { // If the interaction contains a button continue.
        // Handle different button IDs
        if (interaction.customId === 'claim') { // If the button ID is claim continue.
          if (interaction.member.permissions.has('ModerateMembers' || 'BanMembers' || 'KickMembers' || 'Administrator')) { // If the member clicking the button has any of these permissions continue.
            // Code to run when 'myButtonId' is clicked
            if (interaction.message) {
         await interaction.message.edit({ components: [ new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId('close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger)).addComponents( new ButtonBuilder().setCustomId('closewithreason').setLabel('Close with Reason').setEmoji('🗒️').setStyle(ButtonStyle.Danger)) ] });
            }
            if (interaction) {
         await interaction.reply({ content: `Your ticket has been claimed by ${interaction.member.user}`, ephemeral: true })
            }
          } else { // Member clicking the button doesn't have permission therefore show them an error message.
            if (interaction) {
            await interaction.reply({ content: `You don't have permission to claim this ticket.`, ephemeral: true })
            }
          }
        }
        
        if (interaction.customId === 'close') { // Close ticket button was clicked so we are going to delete the ticket channel that was created.
          // Code to run when 'myButtonId' is clicked
         await interaction.channel.delete().catch(() => {
          return;
        })
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
        if (interaction) {
        await interaction.showModal(modal);
        }
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
        if (interaction) {
        await interaction.showModal(modal);
        }
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
          if (interaction) {
          await interaction.showModal(modal);
          }
            }
      }
      // End of Buttons

      // Beginning of Modal Submissions
        if (interaction.type === InteractionType.ModalSubmit) { // If a form modal was submitted do something.
          if (interaction.customId === 'closewithreasonmodal') { // Reason for closing ticket was submitted so DM the user the reason and close the ticket channel that was created.
            const response =
              interaction.fields.getTextInputValue('closereasoninput');
            await interaction.deferReply();
            const embed = new EmbedBuilder()
            .setTitle(`Ticket Closed!`)
            .setDescription(`Your ticket has been closed!\n**Reason:** ${response}\nIf you are still having issues please open another ticket by running **/ticket** command in ${interaction.guild.name} bot commands channel!`)
            .setColor('Red')
            .setAuthor({ name: interaction.member.user.tag, iconURL: interaction.member.user.displayAvatarURL() })
            .setTimestamp(Date.now())
            .setFooter({ text: interaction.guild.name })
            await interaction.member.send({ embeds: [embed] })
            await interaction.channel.delete().catch((err) => {
              console.log(err.message)
            })
          }
          if (interaction.customId === 'serversetupmodal') { // Server settings were submitted so save the settings to that specific server. Useful for handling multi-guilds.
            await interaction.deferReply({ ephemeral: true })
            const response = interaction.fields.getTextInputValue('setcookieinput');
            const response2 = interaction.fields.getTextInputValue('setgroupinput');
            const response3 = interaction.fields.getTextInputValue('setminrankinput');
            const response4 = interaction.fields.getTextInputValue('setgameidinput');
            await interaction.editReply(`✅ **SUCCESS** | This server has been set up successfully!\nThis message will auto-delete in 5 seconds!`).then(() => {
              setTimeout(() => {
               interaction.deleteReply().catch((err) => {
                return;
               })
              }, 5000)
            })
            bot.db.set(`ServerSetup_${interaction.guild.id}`, { rblxcookie: response, groupid: response2, minrank: response3, gameid: response4})
            const RobloxCookie = bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)
            if (RobloxCookie) {
            await rbxbot.setCookie(RobloxCookie, interaction.guild.id);
            const CurrentUser = await rbxbot.getCurrentUser("UserName");
            interaction.guild.members.me.setNickname(CurrentUser);
            }
          }
          if (interaction.customId === 'setuplogsmodal') { // Log settings were submitted so save the settings to that specific server. Useful for handling multi-guilds.
            await interaction.deferReply({ ephemeral: true })
            const response = interaction.fields.getTextInputValue('setshoutchannel');
            const response2 = interaction.fields.getTextInputValue('setserverlogchannel');
            const response3 = interaction.fields.getTextInputValue('setsuggestionchannel');
            const response4 = interaction.fields.getTextInputValue('setticketchannel');
            await interaction.editReply(`✅ **SUCCESS** | Logs have been successfully configured!\nThis message will auto-delete in 5 seconds!`).then(() => {
              setTimeout(() => {
               interaction.delete().catch((err) => {
                return;
               })
              }, 5000)
            })
            bot.db.set(`LogsSetup_${interaction.guild.id}`, { shoutchannel: response, serverlogs: response2, suggestionchannel: response3, ticketchannel: response4 })
          }
        }
      } catch(err) {
        console.log(err.message)
      }
    });
    // End of Modal Submissions.

    // Suggestions Upvote and Downvote system.
      bot.on('messageReactionAdd', async (reaction, user) => { // A new reaction was added so do something!
        // Filter out bot reactions
        const users = reaction.users.cache.filter(u => !u.bot);
        let suggestionchannel = bot.db.get(`LogsSetup_${reaction.message.guild.id}.suggestionchannel`)
        if (suggestionchannel) {
          try{
            if (reaction.message.channel.id === `${suggestionchannel}`) {
        if (reaction.emoji.name === '❌' && users.size >= 1) {
            // Remove bot reaction from users collection. This DOES NOT remove the bot's reaction. It just removes it from being counted.
            if (users) {
            users.delete(bot.user.id)
            }
            // Update reaction count
            reaction.count = users.size;
      
            // Delete message if count is 10 or more
            if (reaction.count >= 10) { // Suggestion has 10 or more downvotes so delete the suggestion.
              await reaction.message.delete().catch(() => {
                return;
              })
            }
        }

        if (reaction.emoji.name === '✅' && users.size >= 1) {
              // Remove bot reaction from users collection. This DOES NOT remove the bot's reaction. It just removes the bot from being counted in the reactions.
              if (users) {
              users.delete(bot.user.id)
              }
              // Update reaction count
              reaction.count = users.size;
              
              // Get all messages in the channel
              const messages = await reaction.message.channel.messages.fetch();
              
              // Create a map to store the number of reactions for each message
              const reactionCount = new Map();
              
              // Iterate over all messages and count the number of reactions for each message
              messages.forEach((message) => {
                const reaction = message.reactions.cache.find((r) => r.emoji.name === '✅');
                if (reaction) {
                  reactionCount.set(message.id, reaction.count);
                }
              });
              
              // Sort the messages by the number of reactions in descending order
              const sortedMessages = Array.from(reactionCount.entries()).sort((a, b) => b[1] - a[1]);
              
              // Pin the message with the most reactions
              if (sortedMessages.length > 0) {
                const topMessageId = sortedMessages[0][0];
                const topMessage = messages.get(topMessageId);
                const topMessageReactions = sortedMessages[0][1];

                // Check if there is a second message with the same number of reactions
                const secondMessageReactions = sortedMessages.length > 1 ? sortedMessages[1][1] : -1;
                
                if (topMessageReactions > secondMessageReactions) { // Out of all the messages in the suggestions channel the one with the most Upvotes is pinned to the top.
                  // Pin the message with the most reactions
                  await topMessage.pin();
                }
                const bottomMessageId = sortedMessages[sortedMessages.length - 1][0];
const bottomMessage = messages.get(bottomMessageId);
const bottomMessageReactions = bottomMessage ? sortedMessages[sortedMessages.length - 1][1] : 0;

// Unpin the bottom message if it's already pinned
if (bottomMessage && bottomMessage.pinned && bottomMessageReactions < topMessageReactions) {
  await bottomMessage.unpin();
}

              }
          }
        }
        } catch (error) {
          console.log(error.message);
        }
        }
      });


      bot.on('messageReactionRemove', async (reaction, user) => {
        // Filter out bot reactions
        const users = reaction.users.cache.filter(u => !u.bot);
        let suggestionchannel = bot.db.get(`LogsSetup_${reaction.message.guild.id}.suggestionchannel`)
        if (suggestionchannel) {
          try {
            if (reaction.message.channel.id === `${suggestionchannel}`) {
        if (reaction.emoji.name === '❌' && users.size >= 1) {
            // Remove bot reaction from users collection. This DOES NOT remove the bot's reaction. It just removes the bot from being counted in the reactions.
            if (users) {
            users.delete(bot.user.id)
            }
            // Update reaction count
            reaction.count = users.size;
      
            // Delete message if count is 10 or more
            if (reaction.count >= 10) {
              await reaction.message.delete().catch(() => {
                return;
              })
            }
        }

            // Ignore reactions from bots and reactions that are not the checkmark emoji
            if (reaction.emoji.name === '✅' && users.size >= 1) {
          
              // Get all messages in the channel
              const messages = await reaction.message.channel.messages.fetch();
          
              // Create a map to store the number of reactions for each message
              const reactionCount = new Map();
          
              // Iterate over all messages and count the number of reactions for each message
              messages.forEach((message) => {
                const reaction = message.reactions.cache.find((r) => r.emoji.name === '✅');
                if (reaction) {
                  reactionCount.set(message.id, reaction.count);
                }
              });
          
              // Sort the messages by the number of reactions in descending order
              const sortedMessages = Array.from(reactionCount.entries()).sort((a, b) => b[1] - a[1]);
          
              // Pin the message with the most reactions
              if (sortedMessages.length > 0) {
                const topMessageId = sortedMessages[0][0];
                const topMessage = messages.get(topMessageId);
                const topMessageReactions = sortedMessages[0][1];
          
                // Check if there is a second message with the same number of reactions
                const secondMessageReactions = sortedMessages.length > 1 ? sortedMessages[1][1] : -1;
          
                if (topMessageReactions > secondMessageReactions) {
                  // Pin the message with the most reactions
                  await topMessage.pin();
                }
          
                // Unpin the bottom message if it's already pinned
                const bottomMessageId = sortedMessages[sortedMessages.length - 1][0];
                const bottomMessage = messages.get(bottomMessageId);
                const bottomMessageReactions = bottomMessage ? sortedMessages[sortedMessages.length - 1][1] : 0;
          
                if (bottomMessage && bottomMessage.pinned && bottomMessageReactions < topMessageReactions) {
                  await bottomMessage.unpin();
                }
              }
            }
          }
            } catch (error) {
              console.log(error.message);
            }
        }
      });
// End of Upvote and Downvote system
for (const [ids] of bot.guilds.cache) {
  const guild = ids;
  const guildObject = bot.guilds.cache.get(`${guild}`)
// Retrieve server data from database.
  if (bot.db.get(`ServerSetup_${guild}.rblxcookie`) && bot.db.get(`ServerSetup_${guild}.groupid`) && bot.db.get(`ServerSetup_${guild}.minrank`)) {
  let RobloxCookie = bot.db.get(`ServerSetup_${guild}.rblxcookie`) 
  let Group = bot.db.get(`ServerSetup_${guild}.groupid`)

  if (RobloxCookie && Group) {
        await rbxbot.setCookie(RobloxCookie, guild) // Log Roblox Bot in.
    .then(async(success) => { // Required if the group's shout is private
        console.log(`${await rbxbot.getCurrentUser("UserName")} Logged in.`);
      
    console.log(`${bot.user.username} is Running`)
    bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
      
    // Fetch data and auto-populate command options.
            bot.on('interactionCreate', async interaction => {
                if (!interaction.isAutocomplete()) return;

                const serverData = bot.db.get(`ServerSetup_${interaction.guild.id}`)
                const serverSettings = bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`) && bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`) && bot.db.get(`ServerSetup_${interaction.guild.id}.minrank`)
                if (!serverData && serverSettings) return;
                try {
                const RobloxGroup = serverData.groupid
                if (interaction.commandName === 'rank') {
                  if (!interaction.deferred && !interaction.replied) {
                    if (interaction.options.get('rank')) {
                    const groupInfo = await rbxbot.getGroup(RobloxGroup)
                    const rank = await rbxbot.getRankInGroup(RobloxGroup, groupInfo.owner.userId)
                    const ownerrole = await rbxbot.getRole(RobloxGroup, rank)
                    if (RobloxCookie) {
                    await rbxbot.setCookie(RobloxCookie, interaction.guild.id)
                    const groupbot = await rbxbot.getCurrentUser("UserID")
                    const botrank = await rbxbot.getRankInGroup(RobloxGroup, groupbot)
                    const botrole = await rbxbot.getRole(RobloxGroup, botrank)
                    const grouproles = await rbxbot.getRoles(RobloxGroup)
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

                if (interaction.options.get('username')) {
                    const name = await interaction.options.get('username').value
                    fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
                    if (r.status != 200) { return; }
                    return r.url.match(/\d+/)[0];
                }).then(async id => {
                    const username = await rbxbot.getUsernameFromId(id)
                    const userId = await rbxbot.getIdFromUsername(username)
                    await interaction.respond([
                        {
                            name: `${username} (${userId})`,
                            value: username
                        }
                    ]);
                }).catch((error) => {
                    return;
                })
                }
              }
            }
            if (interaction.commandName === 'demote') {

            if (interaction.options.get('username')) {
                const name = await interaction.options.get('username').value
                fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
                if (r.status != 200) { return; }
                return r.url.match(/\d+/)[0];
            }).then(async id => {
                const username = await rbxbot.getUsernameFromId(id)
                const userId = await rbxbot.getIdFromUsername(username)
                console.log(userId)
                await interaction.respond([
                    {
                        name: `${username} (${userId})`,
                        value: username
                    }
                ]);
            }).catch((error) => {
                return;
            })
            }
        }
        if (interaction.commandName === 'promote') {

            if (interaction.options.get('username')) {
                const name = await interaction.options.get('username').value
                fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
                if (r.status != 200) { return; }
                return r.url.match(/\d+/)[0];
            }).then(async id => {
                const username = await rbxbot.getUsernameFromId(id)
                const userId = await rbxbot.getIdFromUsername(username)
                await interaction.respond([
                    {
                        name: `${username} (${userId})`,
                        value: username
                    }
                ]);
            }).catch((error) => {
                return;
            })
            }
        }
        if (interaction.commandName === 'forceverify') {

          const options = interaction.options;
          
          try {
              const name = options.get('rblxusername') ? options.get('rblxusername').value : options.get('nickname').value;
              
              const response = await fetch(`https://www.roblox.com/users/profile?username=${name}`);
      
              if (!response.ok || response.status !== 200) {
                  return;
              }
      
              const id = response.url.match(/\d+/)[0];
              const username = await rbxbot.getUsernameFromId(id)
              const userId = await rbxbot.getIdFromUsername(username)
      
              if (options.get('nickname')) {
                  const displayName = await rbxbot.getPlayerInfo(userId)
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
                return r.url.match(/\d+/)[0];
            }).then(async id => {
                const username = await rbxbot.getUsernameFromId(id)
                const userId = await rbxbot.getIdFromUsername(username)
                await interaction.respond([
                    {
                        name: `${username} (${userId})`,
                        value: username
                    }
                ]);
            }).catch((error) => {
                return;
            })
            }
        }
        if (interaction.commandName === 'unverify') {

            if (interaction.options.get('username')) {
                const name = await interaction.options.get('username').value
                fetch(`https://www.roblox.com/users/profile?username=${name}`).then(r => {if (!r.ok) { return; }
                if (r.status != 200) { return; }
                return r.url.match(/\d+/)[0];
            }).then(async id => {
                const username = await rbxbot.getUsernameFromId(id)
                const userId = await rbxbot.getIdFromUsername(username)
                await interaction.respond([
                    {
                        name: `${username} (${userId})`,
                        value: username
                    }
                ]);
            }).catch((error) => {
                return;
            })
            }
        }
        if (interaction.commandName === 'verify') {
          const options = interaction.options;
          
          try {
              const name = options.get('username') ? options.get('username').value : options.get('nickname').value;
              
              const response = await fetch(`https://www.roblox.com/users/profile?username=${name}`);
      
              if (!response.ok || response.status !== 200) {
                  return;
              }
      
              const id = response.url.match(/\d+/)[0];
              const username = await rbxbot.getUsernameFromId(id)
              const userId = await rbxbot.getIdFromUsername(username)
      
              if (options.get('nickname')) {
                  const displayName = await rbxbot.getPlayerInfo(userId)
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
    
            if (!response.ok || response.status !== 200) {
                return;
            }
    
            const id = response.url.match(/\d+/)[0];
            const username = await rbxbot.getUsernameFromId(id)
            const userId = await rbxbot.getIdFromUsername(username)
    
            if (options.get('nickname')) {
                const displayName = await rbxbot.getPlayerInfo(userId)
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
  
          if (!response.ok || response.status !== 200) {
              return;
          }
  
          const id = response.url.match(/\d+/)[0];
          const username = await rbxbot.getUsernameFromId(id)
          const userId = await rbxbot.getIdFromUsername(username)
  
          if (options.get('nickname')) {
              const displayName = await rbxbot.getPlayerInfo(userId)
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
                return r.url.match(/\d+/)[0];
            }).then(async id => {
                const username = await rbxbot.getUsernameFromId(id)
                const userId = await rbxbot.getIdFromUsername(username)
                await interaction.respond([
                    {
                        name: `${username} (${userId})`,
                        value: username
                    }
                ]);
            }).catch((error) => {
                return;
            })
            }
        }
      } catch (error) {
        return;
      }
            });

//----------------------------------------Roblox Group Logs---------------------------------------------------------------------------------------------------------------------------

let RobloxGroup = bot.db.get(`ServerSetup_${guild}.groupid`);
let RobloxShouts = bot.db.get(`LogsSetup_${guild}.shoutchannel`)
let onShout = rbxbot.onShout(RobloxGroup);
onShout.on('data', async function(post) {
    let group = await rbxbot.getGroup(RobloxGroup)
    let groupName = group.name;
  if (!post.poster) return;
let avatar = await rbxbot.getPlayerThumbnail(post.poster.userId, "48x48", "png", true, "headshot")
let avatarurl = avatar[0].imageUrl;
const shoutchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${RobloxShouts}`)

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
    value: `${post.body}`,
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
shoutchannel.send({ embeds: [embed] }, ms(Time))

}); 
 
onShout.on('error', function (err) {
   console.log(err)
}, ms(Time));
 

const messageEvent = rbxbot.onMessage()
messageEvent.on("data", async function(data) {
  try {
 let message = data.body;
 const senderUserId = data.sender.id;
 const messages = [
  { 
      role: "system", 
      content: "Search the web for answers to a user's question.",
  },
  {
      role: "user",
      content: message,
  },
];

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: messages,
  temperature: 0.7,
  max_tokens: 500,
});

console.log(completion)
const advice = `${completion.choices[0].message.content}\n\nThis is an automated message from Chat GPT.\n\nCredits: Epicwarrior(@AEW745)\n\nSincerely,\nEpicwarrior\nBot Creator`;

rbxbot.message(senderUserId, "Chat GPT response!", advice)
  } catch (err) {
    console.log(err.message)
  }
})
messageEvent.on("error", function(err) {
 console.error("Something went wrong: ", err)
 // Handle error as needed
})

let RobloxCookie = bot.db.get(`ServerSetup_${guild}.rblxcookie`)
let ServerLogs = bot.db.get(`LogsSetup_${guild}.serverlogs`)
let onAudit = rbxbot.onAuditLog(RobloxGroup, RobloxCookie)
onAudit.on('data', async function(data) {
  let group = await rbxbot.getGroup(RobloxGroup)
  let groupName = group.name;
  console.log(data)
    if (data.actionType === 'Remove Member') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;


        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) kicked user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Change Rank') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;
        

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) changed user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s rank from ${data.description.OldRoleSetName} to ${data.description.NewRoleSetName}`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Post Status') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;
        

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) changed the group shout to "${data.description.Text}"`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Configure Group Game') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) updated [**${data.description.TargetName}**](https://www.roblox.com/universes/configure?id=${data.description.TargetId}):`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Spend Group Funds') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;
        

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) spent <:Robux:1099147135569629236> ${data.description.Amount} of group funds for: ${data.description.ItemDescription}`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Delete Post') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) deleted post "${data.description.PostDesc}" by user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Delete Ally') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) removed group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId}) as an ally`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Send Ally Request') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) sent an ally request to group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Accept Ally Request') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;
        

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) accepted group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})'s ally request`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Decline Ally Request') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) declined group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})'s ally request`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Configure Badge') {
        if (data.description.Type === 0) {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) enabled the badge [**${data.description.BadgeName}**](https://www.roblox.com/badges/${data.description.BadgeId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
        } else if (data.description.Type === 1) {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) disabled the badge [**${data.description.BadgeName}**](https://www.roblox.com/badges/${data.description.BadgeId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
        }
    } else if (data.actionType === 'Create Items') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created the group item [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Publish Place') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) published new version ${data.description.VersionNumber} of [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Save Place') {
        let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) saved place [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Create Group Asset') {
      let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

      const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created asset [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    } else if (data.actionType === 'Update Group Asset') {
      let avatar = await rbxbot.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
        let avatarurl = avatar[0].imageUrl;

        const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)

        const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created new version ${data.description.VersionNumber} of asset [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
    }
})

onAudit.on('error', function(err) {
    console.log(err)
}, ms(Time))

    })

    app.get("/verify", async (req, res) => {
      try {
          const User = req.query.userid;
          const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await rbxbot.getPlaceInfo([PlaceId]);
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await rbxbot.getGroupGames(RobloxGroup, "PUBLIC");
          let responseData;
          let found = false;
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
                  if (parseInt(User) && matchesId === true) {
                      await guildObject.members.fetch();
                      const member = guildObject.members.cache.find(m => {
                          const DiscordUser = bot.db.get(`Verification_${guild}_${m.user.id}_${User}.discordid`);
                          return DiscordUser;
                      });
    
                      if (member) {
                          const RobloxUser = bot.db.get(`Verification_${guild}_${member.user.id}_${parseInt(User)}.robloxid`);
                          const DiscordUser = bot.db.get(`Verification_${guild}_${member.user.id}_${parseInt(User)}.discordid`);
                          const user = await guildObject.members.fetch(DiscordUser);
    
                          if (DiscordUser && RobloxUser && user && user.user) {
                              responseData = { RobloxUser: RobloxUser, DiscordUser: user.user.tag };
                              found = true;
                          }
                          if (found && !responseSent) {
                            responseSent = true;
                            res.json(responseData);
                          }
                      }
                      if (!responseSent) {
                        res.send('Bruh');
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
    
    app.use(bodyParser.urlencoded({ extended: true }));
    
      app.post("/confirm", async(req, res) => {
        try {
          const User = req.body.userId;
          const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await rbxbot.getPlaceInfo([PlaceId]);
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await rbxbot.getGroupGames(RobloxGroup, "PUBLIC");
          let found = false;
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (parseInt(User) && matchesId === true) {
                      const member = guildObject.members.cache.find(m => {
                          const DiscordUser = bot.db.get(`Verification_${guild}_${m.user.id}_${User}.discordid`);
                          return DiscordUser;
                      });
                  if (member) {
                    const RobloxUser = bot.db.get(`Verification_${guild}_${member.user.id}_${parseInt(User)}.robloxid`);
                          const DiscordUser = bot.db.get(`Verification_${guild}_${member.user.id}_${parseInt(User)}.discordid`);
                          const user = await guildObject.members.fetch(DiscordUser);
    
                      if (DiscordUser && RobloxUser && user && user.user) {
                        const nickname = bot.db.get(`Verification_${guild}_${user.user.id}_${User}.discordnick`);
                        let findRole3 = "Verified"
          const role3 = await guildObject.roles.cache.find(r => r.name.includes(findRole3))
          if (!user.roles.cache.has(role3.id)) {
    
          let robloxname = await rbxbot.getUsernameFromId(parseInt(User))
    
          guildObject.members.cache.find(m => {
            bot.db.set(`RobloxInfo_${guild}_${m.user.id}`, { discordid: user.user.id, robloxid: User, robloxusername: robloxname });
          })
      
          let rank = await rbxbot.getRankInGroup(RobloxGroup, User)
          let role1 = await rbxbot.getRole(RobloxGroup, rank)
          let findRole = "Verified"
          let findRole2 = role1.name
          const role = await guildObject.roles.cache.find(r => r.name.includes(findRole))
          const role2 = await guildObject.roles.cache.find(r => r.name.includes(findRole2))
          if (user && role && role2) {
            if (!user.roles.cache.has(role.id)) {
              await user.roles.add(role.id);
          }
      
          if (!user.roles.cache.has(role2.id)) {
              await user.roles.add(role2.id);
          }
            }
          
          if (nickname) {
          
          user.setNickname(nickname[0])
          }
                        found = true
                  if (found && !responseSent) {
                    // After processing, send a response back to Roblox
                    res.json({ success: true, message: 'success' });
                     responseSent = true;
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
          const PlaceInfo = await rbxbot.getPlaceInfo([PlaceId]);
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await rbxbot.getGroupGames(RobloxGroup, "PUBLIC");
    

          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
            if (parseInt(User) && matchesId === true) {
                      const username = await rbxbot.getUsernameFromId(User);
                    const rank = await rbxbot.getRankInGroup(RobloxGroup, User);
                    const role = await rbxbot.getRole(RobloxGroup, rank);
                    let newrole = await rbxbot.getRole(RobloxGroup, parseInt(Rank));
                    let group = await rbxbot.getGroup(RobloxGroup);
                    let groupName = group.name;
                    let groupOwner = group.owner.username;
                    const groupbot = await rbxbot.getCurrentUser("UserID");
                    const botrank = await rbxbot.getRankInGroup(RobloxGroup, groupbot);
                    const botrole = await rbxbot.getRole(RobloxGroup, botrank);
                    
                    if ((role.rank) <= (botrole.rank) && (role.rank) >= 1) {
                        await rbxbot.message(parseInt(User), `${groupName} Rank Change`, `Hello ${username}, Your rank has been Changed in ${groupName} to ${newrole.name} from ${role.name}! If you have any questions please contact ${groupOwner} or the Co-Owners of the Group.`);
                        await rbxbot.setRank(RobloxGroup, parseInt(User), parseInt(newrole.rank));
                        res = true;
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
          const PlaceInfo = await rbxbot.getPlaceInfo([PlaceId]);
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await rbxbot.getGroupGames(RobloxGroup, "PUBLIC");
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (parseInt(User) && matchesId === true) {
                      const username = await rbxbot.getUsernameFromId(User);
        const rank = await rbxbot.getRankInGroup(RobloxGroup, User);
        const role = await rbxbot.getRole(RobloxGroup, rank);
        let newrank = role.rank + 1;
        let newrole = await rbxbot.getRole(RobloxGroup, newrank);
        let group = await rbxbot.getGroup(RobloxGroup);
        let groupName = group.name;
        let groupOwner = group.owner.username;
        const groupbot = await rbxbot.getCurrentUser("UserID");
        const botrank = await rbxbot.getRankInGroup(RobloxGroup, groupbot);
        const botrole = await rbxbot.getRole(RobloxGroup, botrank);
        if ((newrole.rank) < (botrole.rank)) {
        await rbxbot.message(parseInt(User), `${groupName} Promotion`, `Hello ${username}, You have been Promoted in ${groupName} to ${newrole.name} from ${role.name}! If you have any questions please contact ${groupOwner} or the Co-Owners of the Group.`);
        await rbxbot.promote(RobloxGroup, parseInt(User));
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
          const PlaceInfo = await rbxbot.getPlaceInfo([PlaceId]);
          const RobloxGroup = PlaceInfo[0].builderId;
          const groupgames = await rbxbot.getGroupGames(RobloxGroup, "PUBLIC");
    
          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (parseInt(User) && matchesId === true) {
                      const username = await rbxbot.getUsernameFromId(User);
                      const rank = await rbxbot.getRankInGroup(RobloxGroup, User);
                      const role = await rbxbot.getRole(RobloxGroup, rank);
                      let newrank = role.rank - 1;
                      let newrole = await rbxbot.getRole(RobloxGroup, newrank);
                      let group = await rbxbot.getGroup(RobloxGroup);
                      let groupName = group.name;
                      let groupOwner = group.owner.username;
                    if ((newrole.rank) >= 1){
                      await rbxbot.message(User, `${groupName} Demotion`, `Hello ${username}, You have been Demoted in ${groupName} to ${role.name} from ${newrole.name}! If you have any questions please contact ${groupOwner} or the Co-Owners of the Group.`);
                      await rbxbot.demote(RobloxGroup, parseInt(User));
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
    
    app.get("/shouts", async(req, res) => {
      try {
        const Message = req.query.shout;
        const PlaceId = req.headers['roblox-id'];
          const PlaceInfo = await rbxbot.getPlaceInfo([PlaceId]);
          const RobloxGroup = PlaceInfo[0].builderId;
          if (Group.includes(RobloxGroup)) {
            console.log(Group)
            await rbxbot.setCookie(RobloxCookie, guild)
          const groupgames = await rbxbot.getGroupGames(RobloxGroup, "PUBLIC");

          let responseSent = false; // Flag to track whether response has been sent
    
          const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (matchesId === true) {
                      await rbxbot.shout(RobloxGroup, Message)
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
const RobloxGroup = bot.db.get(`ServerSetup_${guild}.groupid`)
const ServerLogs = bot.db.get(`LogsSetup_${guild}.serverlogs`)
// Define a function to fetch the current member count and username of the most recent member from the Roblox API
if (ServerLogs && RobloxGroup) {
async function fetchMemberData() {
  try {
  const response = await fetch(`https://groups.roblox.com/v1/groups/${RobloxGroup}`);
  const data = await response.json();
  return data.memberCount
  } catch (err) {
    return;
  }
  
}

async function fetchMostRecentMember() {
  try {
    const response = await fetch(`https://groups.roblox.com/v1/groups/${RobloxGroup}/users?sortOrder=Desc`);
    const data = await response.json();
    const mostRecentMember = data.data[0];
    const userId = mostRecentMember.user.userId;
    const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const userData = await userResponse.json();
    const username = userData;
    return username;
  } catch (err) {
    return;
  }
  }

// Define a function to check for changes in the member count and log the username of the most recent member if the count increases
async function checkMemberCount() {
  try {
  const currentCount = await fetchMemberData();
  
  if (previousCount !== null) {
  if (currentCount > previousCount) {
    let currentMember = await fetchMostRecentMember();
    let group = await rbxbot.getGroup(RobloxGroup)
    let groupName = group.name;
    let avatar = await rbxbot.getPlayerThumbnail(currentMember.id, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;
    const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Group Member Joined!**`)
    .addFields(
      {
        name: '**User:**',
        value: `${currentMember.name}`,
        inline: true
      },
      {
        name: '**UserId:**',
        value: `${currentMember.id}\n**Joined the Roblox Group!**`,
        inline: true
      },
      {
        name: '**Links:**',
        value: `[Group](https://www.roblox.com/groups/${RobloxGroup})\n[Profile](https://www.roblox.com/users/${currentMember.id}/profile)`,
        inline: true
      }
    )
    .setAuthor({ name: currentMember.name, iconURL: avatarurl})
    .setColor(`Blue`)
    .setFooter({ text: groupName })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] }, ms(Time))
    previousCount = currentCount;
  } else if (currentCount < previousCount) {
    let group = await rbxbot.getGroup(RobloxGroup)
    let groupName = group.name;
    const logchannel = bot.guilds.cache.get(`${guild}`).channels.cache.get(`${ServerLogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Group Member Left!**`)
    .setDescription(`**A Group member has left the Group!**`)
    .setColor(`Red`)
    .setFooter({ text: groupName })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] }, ms(Time))
  }
}
previousCount = currentCount;
} catch (err) {
  console.log(err.message)
}
}


// Call the checkMemberCount function every 30 seconds
rbxbot.shortPoll({
  getLatest: async function(latest) {
    const given = [];
    const currentCount = await fetchMemberData()
      latest = currentCount
    given.push(currentCount)
    await checkMemberCount()
    return {
      latest: latest,
      data: given
    }
  },
  delay: 10000
})

let currentUser = await rbxbot.getCurrentUser();
 console.log(currentUser.UserName);
}
  }
}
// End of looping through each guild.

//------------------------------------------------------Discord Audit Logs-----------------------------------------------------------------------------------//

     bot.on('guildBanAdd', async (user) => {
          let serverlogs = bot.db.get(`LogsSetup_${user.guild.id}.serverlogs`)
          if (serverlogs) {
            const bans = await user.guild.bans.fetch();
        const ban = bans.find((banEntry) => banEntry.user.id === user.user.id);
        const banreason = ban.reason || "No Reason Provided!"
        
        // Get the audit log entries for ban actions
        const auditLogs = await user.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberBanAdd
        });

        console.log(auditLogs)
      
        // Find the latest ban action by the user who triggered it
        const banLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000);                                                   
        if (banLog) {
          const { executor } = banLog;
        const logchannel = bot.guilds.cache.get(`${user.guild.id}`).channels.cache.get(`${serverlogs}`)
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} banned ${user.user} from ${user.guild.name} for "${banreason}"`)
        .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: user.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
          }
        }
      });

      bot.on('guildBanRemove', async (user) => {
          let serverlogs = bot.db.get(`LogsSetup_${user.guild.id}.serverlogs`)
          if (serverlogs) {
            // Get the audit log entries for unban actions
        const auditLogs = await user.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberBanRemove
        });
      
        // Find the latest unban action by the user who triggered it
        const unbanLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000)
      
        if (unbanLog) {
          const { executor } = unbanLog;
          const logchannel = bot.guilds.cache.get(`${user.guild.id}`).channels.cache.get(`${serverlogs}`)
          const embed = new EmbedBuilder()
          .setTitle(`**Server Audit Logs**`)
          .setDescription(`${executor} removed ban for ${user.user} from ${user.guild.name}`)
          .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
          .setColor(`Red`)
          .setFooter({ text: user.guild.name })
          .setTimestamp(Date.now())
          logchannel.send({ embeds: [embed] }, ms(Time))
          }
        }
      });

      bot.on('guildMemberAdd', async (user) => {
        let serverlogs = bot.db.get(`LogsSetup_${user.guild.id}.serverlogs`)
        if (serverlogs) {
        const logchannel = bot.guilds.cache.get(`${user.guild.id}`).channels.cache.get(`${serverlogs}`)
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${user.user} has joined the ${user.guild.name} server!`)
        .setAuthor({ name: user.user.tag, iconURL: user.displayAvatarURL()})
        .setColor(`Green`)
        .setFooter({ text: user.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
        }
      });

      bot.on('guildMemberRemove', async (user) => {
          let serverlogs = bot.db.get(`LogsSetup_${user.guild.id}.serverlogs`)
          if (serverlogs){
                // Get the audit log entries for unban actions
        const auditLogs = await user.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberKick
        });

        // Find the latest unban action by the user who triggered it
        const kickLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000)

          if (kickLog) {
            const { executor, reason } = kickLog;
            const logchannel = bot.guilds.cache.get(`${user.guild.id}`).channels.cache.get(`${serverlogs}`)
            const embed = new EmbedBuilder()
            .setTitle(`**Server Audit Logs**`)
            .setDescription(`${executor} kicked ${user.user} from ${user.guild.name} for ${reason || "No Reason Provided!"}`)
            .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
            .setColor(`Red`)
            .setFooter({ text: user.guild.name })
            .setTimestamp(Date.now())
            logchannel.send({ embeds: [embed] }, ms(Time))
          } else {
            const logchannel = bot.guilds.cache.get(`${user.guild.id}`).channels.cache.get(`${serverlogs}`)
            const embed = new EmbedBuilder()
            .setTitle(`**Server Audit Logs**`)
            .setDescription(`${user.user} has lefted the ${user.guild.name} server!`)
            .setAuthor({ name: user.user.tag, iconURL: user.displayAvatarURL()})
            .setColor(`Red`)
            .setFooter({ text: user.guild.name })
            .setTimestamp(Date.now())
            logchannel.send({ embeds: [embed] }, ms(Time))
          }
        }
      });

      bot.on('channelCreate', async (channel) => {
        let serverlogs = bot.db.get(`LogsSetup_${channel.guild.id}.serverlogs`)
        if (serverlogs) {
          // Get the audit log entries for unban actions
    const auditLogs = await channel.guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelCreate
    });
  
    // Find the latest unban action by the user who triggered it
    const channelLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000);
          if (channelLog) {
        const { executor } = channelLog;
        const logchannel = bot.guilds.cache.get(`${channel.guild.id}`).channels.cache.get(`${serverlogs}`)
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} created "**${channel.name}**" channel for the ${channel.guild.name} server!`)
        .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: channel.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
        }
      }
  });

  bot.on('channelDelete', async (channel) => {
    let serverlogs = bot.db.get(`LogsSetup_${channel.guild.id}.serverlogs`)
    if (serverlogs) {
      // Get the audit log entries for unban actions
const auditLogs = await channel.guild.fetchAuditLogs({
  type: AuditLogEvent.ChannelDelete
});

// Find the latest unban action by the user who triggered it
const channelLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000);

if (channelLog) {
  const { executor } = channelLog;
    const logchannel = bot.guilds.cache.get(`${channel.guild.id}`).channels.cache.get(`${serverlogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Server Audit Logs**`)
    .setDescription(`${executor} deleted "**${channel.name}**" channel for the ${channel.guild.name} server!`)
    .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
    .setColor(`Red`)
    .setFooter({ text: channel.guild.name })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] }, ms(Time))
    }
  }
});

bot.on('channelUpdate', async (oldChannel, newChannel) => {
    let serverlogs = bot.db.get(`LogsSetup_${oldChannel.guild.id}.serverlogs`)
    if (serverlogs) {
      // Get the audit log entries for unban actions
const auditLogs = await oldChannel.guild.fetchAuditLogs({
  type: AuditLogEvent.ChannelUpdate
});

// Find the latest unban action by the user who triggered it
const channelLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000);

if (channelLog) {
  const { executor } = channelLog;
    const logchannel = bot.guilds.cache.get(`${oldChannel.guild.id}`).channels.cache.get(`${serverlogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Server Audit Logs**`)
    .setDescription(`${executor} updated <#${oldChannel.id}> channel to <#${newChannel.id}> channel for the ${newChannel.guild.name} server!`)
    .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
    .setColor(`Red`)
    .setFooter({ text: newChannel.guild.name })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] }, ms(Time))
    }
  }
});

bot.on('guildMemberUpdate', async (oldMember, newMember) => {
  
  let serverlogs = bot.db.get(`LogsSetup_${oldMember.guild.id}.serverlogs`)
  if (serverlogs) {
    // Get the audit log entries for member changes
    const auditLogs = await oldMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberRoleUpdate
    })

    // Find the latest update member action by the user who triggered it
    const channelLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000)

    if (channelLog) {
      const { executor, target, changes } = channelLog ;
      const logchannel = bot.guilds.cache.get(`${oldMember.guild.id}`).channels.cache.get(`${serverlogs}`)
      if (changes[changes.length - 1].key === '$add') {
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} added <@&${changes[changes.length - 1].new[0].id}> role to ${target} in the ${newMember.guild.name} server!`)
        .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: newMember.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
      } else if (changes[changes.length - 1].key === '$remove') {
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} removed <@&${changes[changes.length - 1].new[0].id}> role from ${target} in the ${newMember.guild.name} server!`)
        .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: newMember.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] }, ms(Time))
      }
    }
  }
})

//-----------------------------------------------End of Discord Audit Logs----------------------------------------------------------------//

// Listen to HTTP requests sent to the Webserver.
app.listen(port, () =>
pogger.success(`[SERVER]`.bgCyan, `Server is Ready!`.green, ` App Listening to: https://localhost:${port}`.blue)
)

//------------------------------------------------------------End of Roblox Group Join and Leave Logs--------------------------------------------------------------------------------------------------------

}, ms(Time))

// Log into the Discord Bot.
bot.login(process.env.Token)
// End of Bot!