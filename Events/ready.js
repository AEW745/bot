//Discord
const { Client, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, PermissionsBitField } = require('discord.js')
//Discord Commands
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
//Secrets Database
require('dotenv').config();
//Datastore
const { QuickDB } = require("quick.db");
const db = new QuickDB();
//Open AI
const openai = require("../utils/openAi");
//Translators
const translate = require('@iamtraction/google-translate');
const morse = require('@ozdemirburak/morse-code-translator');
const ISO6391 = require('iso-639-1');
//HTTP request module
const axios = require('axios');
//file convertor
const { File } = require('formdata-node');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { tmpdir } = require('os');
const fs = require('fs');
const path = require('path');

const rest = new REST({version: '10'}).setToken(process.env.Token)

/**
 * 
 * @param {Client} bot 
 */
module.exports.execute = async (bot) => {

  ffmpeg.setFfmpegPath(ffmpegPath);

async function bufferToMp3(buffer) {
  const inputPath = path.join(tmpdir(), `input-${Date.now()}.opus`);
  const outputPath = path.join(tmpdir(), `output-${Date.now()}.mp3`);

  fs.writeFileSync(inputPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .save(outputPath)
      .on('end', () => {
        const mp3Buffer = fs.readFileSync(outputPath);
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        resolve(mp3Buffer);
      })
      .on('error', reject);
  });
}

  bot.on('guildCreate', async (guild) => {
    console.log(`Joined guild: ${guild.name}`);
    bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    // Refresh slash commands for the newly joined guild
    try {
      console.log('Started Refreshing Slash Commands');
      await rest.put(Routes.applicationCommands(bot.user.id), {
        body: bot.slashcommands,
      });
      console.log('Refreshed Slash Commands');
    } catch (error) {
      console.error(error);
    }
  });

  bot.on('guildDelete', async (guild) => {
    console.log(`Left guild: ${guild.name}`);
    bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    // Refresh slash commands for the newly joined guild
    try {
      console.log('Started Refreshing Slash Commands');
      await rest.put(Routes.applicationCommands(bot.user.id), {
        body: bot.slashcommands,
      });
      console.log('Refreshed Slash Commands');
    } catch (error) {
      console.error(error);
    }
  });
  
  bot.on('messageCreate', async (message) => {
    try {
      if (message.author.bot) return;

  if (!(message.attachments.size === 0)) {
  const attachment = message.attachments.first();
  if (attachment.contentType.includes('image')) return;

  try {
  const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
  const opusBuffer = Buffer.from(response.data);

  const mp3Buffer = await bufferToMp3(opusBuffer);
  const file = new File([mp3Buffer], 'converted.mp3', { type: 'audio/mp3' });

  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });

  await message.reply(`**${message.author.username}** said: **${result.text}**\n\n**Text was transcribed from Audio**`).catch(() => {
    message.reply(':x: **ERROR** | An error ocurred when trying to transcribe the Audio. Please try again later!')
  })
} catch (err) {
  console.log('Transcription error:', err);
}
  }

      if (message.content.startsWith('.') || message.content.startsWith('-')) {
        const decoded = morse.decode(message.content);
        message.channel.send(`**${message.author.username}** said: **${decoded}**\n\n**Text was translated from Morse Code to English**`).catch(() => {
          message.channel.send(`:x: **ERROR** | An error ocurred when trying to translate Morse Code. Please try again later!`)
        })
      } else {
       const newtext = JSON.stringify(message.content).slice(1, -1).replace(/\*\*/g, '');
translate(newtext, { to: 'en' }).then(res => {
    if (res.from.language.iso !== 'en' && res.from.language.iso !== '' && ISO6391.getName(res.from.language.iso) !== '' && res.from.language.iso !== null && res.text.toLowerCase() !== newtext.toLowerCase()) {
        message.channel.send(`**${message.author.username}** said: **${res.text}**\n\n**Text was translated from ${ISO6391.getName(res.from.language.iso)} to English**`).catch(() => {
          message.channel.send(`:x: **ERROR** | An error ocurred when trying to translate message. Please try again later!`)
        })
    }
})
    }
    } catch (error) {
      console.log(error)
    }
});

  bot.on('messageCreate', async (message) => {
    // If someone sends a message run the code below.
    if (!message.guild) return;
let suggestionchannel = await await db.get(`LogsSetup_${message.guild.id}.suggestionchannel`)
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
      console.log(err);
    }
  }
}
  })

  const usersMap2 = new Map();
    const LIMIT2 = 5; // Messages
    const DIFF2 = 20000; //message per millisecond
  bot.on('messageCreate', async (message) => {
    if (message.author.id === bot.user.id) return;
     if (message.member?.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages])) return
     if (message.channel.name.toLowerCase().includes('spam')) return;
    try {
      if (usersMap2.has(message.author.id)) {
        const userData = usersMap2.get(message.author.id);
        const { lastMessage, timer } = userData;
        const difference = message.createdTimestamp - lastMessage.createdTimestamp;
        let msgCount = userData.msgCount;
        if (difference > DIFF2) {
          clearTimeout(timer);
          userData.msgCount = 1;
          userData.lastMessage = message;
          userData.timer = setTimeout(() => {
            usersMap2.delete(message.author.id)
          }, 5000);
          usersMap2.set(message.author.id, userData)
        } else {
          ++msgCount;
          if (parseInt(msgCount) === LIMIT2) {
              
              message.reply(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(() => {
                        return;
                    });
                }, 5000);
            })
          }
        }
      } else {
          if (!(await db.get(`Levels_${message.guild.id}_${message.author.id}`))) {
          await db.set(`Levels_${message.guild.id}_${message.author.id}`, {coins: 0, xp: 0, level: 0})
          }
          let xp = await db.get(`Levels_${message.guild.id}_${message.author.id}.xp`)
          let level = await db.get(`Levels_${message.guild.id}_${message.author.id}.level`)
          if (level == 15) return;

          let NeededXP = level * level * 100
        let fn = setTimeout(() => {
          usersMap2.delete(message.author.id)
      }, 5000);
      usersMap2.set(message.author.id, {
          msgCount: 1,
          lastMessage : message,
          timer : fn
      });
      await db.add(`Levels_${message.guild.id}_${message.author.id}.xp`, 23)

      if (xp >= NeededXP) {
        await db.add(`Levels_${message.guild.id}_${message.author.id}.level`, 1)
        await db.sub(`Levels_${message.guild.id}_${message.author.id}.xp`, NeededXP)

        let newxp = await db.get(`Levels_${message.guild.id}_${message.author.id}.xp`)
        let newlevel = await db.get(`Levels_${message.guild.id}_${message.author.id}.level`)

        if (newlevel == 15) return message.reply(`You reached the **Max level ${newlevel}!** You can't earn anymore levels!`).then(msg => {
          setTimeout(() => {
            msg.delete().catch(() => {
              return;
            })
          }, 10000)
        })
        let findRole = (`Level ${newlevel}`).toLowerCase();
const role = message.guild.roles.cache.find(r => r.name.toLowerCase().includes(findRole));
const botHighestRole = message.guild.members.me.roles.highest;
const member = message.guild.members.cache.get(message.author.id);

if (role && member && xp && level) {
  // Check if the bot can manage the role
  if (role.position < botHighestRole.position) {
    if (!member.roles.cache.has(role.id)) {
      try {
        await member.roles.add(role);
      } catch (error) {
        return;
      }
    } else {
      return;
    }
  } else {
    return;
  }
} else {
  return;
}


        message.reply(`You are now **level ${newlevel}** with **${newxp} XP**!`).then(msg => {
          setTimeout(() => {
            msg.delete().catch(() => {
              return;
            })
          }, 10000)
        })
      }
    }
    } catch (err) {
      console.log(err)
    }
  })

  //Generate random warning ID for AutoMod warnings.
  function Generate() {
    let tokenID = [];
    let randomstuff = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    for (let x = 1; x <= 10; x++) {
    tokenID.push(randomstuff[Math.floor(Math.random() * randomstuff.length)]);
    }
    return tokenID.join('');
     }
     const string = Generate();
     
    const usersMap = new Map();
    const LIMIT = 5;
    const DIFF = 20000; //milliseconds
  bot.on('messageCreate', async (message) => {
  if (message.author.id === bot.user.id) return;
   if (message.member?.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages])) return
  if (message.channel.name.toLowerCase().includes('spam')) return;
    try {
    if(usersMap.has(message.author.id)) {
      const userData = usersMap.get(message.author.id);
      const { lastMessage, timer } = userData;
      const difference = message.createdTimestamp - lastMessage.createdTimestamp;
      let msgCount = userData.msgCount;
      let attempts = await db.get(`attempts_${message.guild.id}_${message.author.id}`);
      
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
        if (attempts <= 3 && parseInt(msgCount) === LIMIT) {
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
            await db.set(`userWarnings_${message.guild.id}_${message.author.id}_${string}`, { warningid: string, moderator: bot.user.id, reason: reason});
            let warningIds = await db.get(`userWarnings_${message.guild.id}_${message.author.id}`);
          // Ensure it's an array
if (!Array.isArray(warningIds)) {
  warningIds = [];
}
          warningIds.push(string);
          await db.set(`userWarnings_${message.guild.id}_${message.author.id}`, warningIds);
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
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
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
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
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
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
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
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
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
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
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
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
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
            await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1);
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
            member.send({ embeds: [embed] }).catch(() => { return; }),
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
            message.channel.bulkDelete(LIMIT).catch(console.error)
            await db.delete(`attempts_${message.guild.id}_${message.author.id}`)
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
            member.send({ embeds: [embed] }).catch(() => { return; }),
            member.ban({ deleteMessageSeconds: 60 * 60, reason: reason }).catch(console.error)
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
      console.log(err);
    }
  })
 }
