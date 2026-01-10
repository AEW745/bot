//Discord
const { Client, EmbedBuilder, PermissionsBitField } = require('discord.js')
//Secrets Database
require('dotenv').config();
//Datastore
const { QuickDB } = require("quick.db");
const db = new QuickDB();
//Open AI
const openai = require("../utils/openAi");
//Translators
const translate = require('google-translate-api-x');
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
const usersMap = new Map();
/**
 * 
 * @param {Client} bot
 * @param {Message} message
 */
module.exports.execute = async (bot, message) => {
    ffmpeg.setFfmpegPath(ffmpegPath);
    function Generate() {
        let tokenID = [];
        let randomstuff = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        for (let x = 1; x <= 10; x++) {
            tokenID.push(randomstuff[Math.floor(Math.random() * randomstuff.length)]);
        }
        return tokenID.join('');
    }
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
    const string = Generate();
     
    const LIMIT = 3;
    const DIFF = 15000; //milliseconds
    // ----------------------------------------------[ SUGGESTIONS ]-----------------------------------------------------------
    if (message.guild) {
        let suggestionchannel = await await db.get(`LogsSetup_${message.guild.id}.suggestionchannel`)
        if (suggestionchannel) {
            if (message.author.id === bot.user.id) return;
            if (message.channel.id === `${suggestionchannel}`) {
                try {
                    await message.delete().catch(() => {
                        return;
                    });
                    const embed = new EmbedBuilder()
                    .setTitle(`**New Suggestion!**`)
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                    .setColor(`Blue`)
                    .setDescription(`${message.content}`)
                    .setFooter({ text: message.guild.name })
                    .setTimestamp(Date.now());

                    const sendMessage = await message.channel.send({ embeds: [embed] });
                    if (sendMessage) {
                        await sendMessage.react(`✅`)
                        await sendMessage.react(`❌`)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
    // -----------------------------------------------[ END OF SUGGESTIONS ]---------------------------------------------------
    // ----------------------------------------------[ TRANSLATOR ]-----------------------------------------------------------
    if (!message.author.bot) {
        try {
            if (!(message.attachments.size === 0)) {
                const attachment = message.attachments.first();
                if (attachment.contentType.includes('image')) return;
                const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                const opusBuffer = Buffer.from(response.data);
                const mp3Buffer = await bufferToMp3(opusBuffer);
                const file = new File([mp3Buffer], 'converted.mp3', { type: 'audio/mp3' });

                const result = await openai.audio.transcriptions.create({
                    file,
                    model: 'whisper-1',
                });

                message.channel.send(`**${message.author.username}** said: **${result.text}**\n\n**Text was transcribed from Audio**`)
            }
            if (message.content.startsWith('.') || message.content.startsWith('-')) {
                const decoded = morse.decode(message.content);
                message.channel.send(`**${message.author.username}** said: **${decoded}**\n\n**Text was translated from Morse Code to English**`)
            } else {
                const newtext = JSON.stringify(message.content).slice(1, -1).replace(/\*\*/g, '');
                const res = await translate(newtext, {to: 'en', forceTo: true, autoCorrect: true});
            
                if (!res.from.language || res.from.language.iso === 'en') return;
                    if (res.from.language.iso !== 'en' && res.from.language.iso !== '' && ISO6391.getName(res.from.language.iso) !== '' && res.from.language.iso !== null && res.text.toLowerCase() !== newtext.toLowerCase()) {
                        message.channel.send(`**${message.author.username}** said: **${res.text}**\n\n**Text was translated from ${ISO6391.getName(res.from.language.iso)} to English**`)
                    }
            }
        } catch (error) {
            return;
        }
    }
    // ----------------------------------------------[ END OF TRANSLATOR ]----------------------------------------------------
    // -----------------------------------------------[ AUTO-MOD ANTI-SPAM ABUSE ]--------------------------------------------------------------------------------------------
    if (message.author.id != bot.user.id) {
      
        if (message.member?.permissions.any([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages])) return;
        if (message.channel.name.toLowerCase().includes('spam')) return;
        try {
         if (usersMap.has(message.author.id)) {
                const userData = usersMap.get(message.author.id);
                const { lastMessage, timer } = userData;
                const difference = message.createdTimestamp - lastMessage.createdTimestamp;
                let msgCount = userData.msgCount;
                let attempts = await db.get(`attempts_${message.guild.id}_${message.author.id}`);

                if (difference > DIFF) {
                    clearTimeout(timer)
                    userData.msgCount = 1
                    userData.lastMessage = message
                    userData.timer = setTimeout(() => {
                        usersMap.delete(message.author.id)
                    }, 5000);
                    usersMap.set(message.author.id, userData)
                } else {
                    ++msgCount
                    let reason = "[AutoMod] Spamming isn't allowed!"
                    let member = message.guild.members.cache.get(message.author.id)
                    if (attempts <= 3 && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        await db.set(`userWarnings_${message.guild.id}_${message.author.id}_${string}`, { warningid: string, moderator: bot.user.id, reason: reason})
                        let warningIds = await db.get(`userWarnings_${message.guild.id}_${message.author.id}`)

                        if (!Array.isArray(warningIds)) {
                            warningIds = []
                        }

                        warningIds.push(string)
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

                        message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
                            const userMessages = messages.filter(msg => msg.author.id === message.author.id)
                            Promise.all([
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                }),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000)
                                }),
                                message.channel.bulkDelete(userMessages)
                            ])
                        }).catch(console.error)
                    } else if (attempts == 4 && member.moderatable && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        reason = "[AutoMod] Timed out for Spamming! Duration: 1 Minute!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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

                        message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
                            const userMessages = messages.filter(msg => msg.author.id === message.author.id);
                            Promise.all([
                                member.timeout(60000, reason),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                })
                            ])
                            message.channel.bulkDelete(userMessages)
                        }).catch(console.error);
                    } else if (attempts == 5 && member.moderatable && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        reason = "[AutoMod] Timed out for Spamming! Duration: 5 Minute!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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

                        message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
                            const userMessages = messages.filter(msg => msg.author.id === message.author.id);
                            Promise.all([
                                member.timeout(300000, reason),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                })
                            ])
                            message.channel.bulkDelete(userMessages)
                        }).catch(console.error);
                    } else if (attempts == 6 && member.moderatable && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        reason = "[AutoMod] Timed out for Spamming! Duration: 10 Minute!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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

                        message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
                            const userMessages = messages.filter(msg => msg.author.id === message.author.id);
                            Promise.all([
                                member.timeout(600000, reason),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                })
                            ])
                            message.channel.bulkDelete(userMessages)
                        }).catch(console.error);
                    } else if (attempts == 7 && member.moderatable && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        reason = "[AutoMod] Timed out for Spamming! Duration: 1 Hour!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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

                        message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
                            const userMessages = messages.filter(msg => msg.author.id === message.author.id);
                            Promise.all([
                                member.timeout(3600000, reason),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                })
                            ])
                            message.channel.bulkDelete(userMessages)
                        }).catch(console.error);
                    } else if (attempts == 8 && member.moderatable && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        reason = "[AutoMod] Timed out for Spamming! Duration: 1 Day!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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

                        message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
                            const userMessages = messages.filter(msg => msg.author.id === message.author.id);
                            Promise.all([
                                member.timeout(86400000, reason),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                })
                            ])
                            message.channel.bulkDelete(userMessages)
                        }).catch(console.error);
                    } else if (attempts == 9 && member.moderatable && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        reason = "[AutoMod] Timed out for Spamming! Duration: 1 Week!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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

                        message.channel.messages.fetch({ limit: LIMIT }).then(messages => {
                            const userMessages = messages.filter(msg => msg.author.id === message.author.id);
                            Promise.all([
                                member.timeout(604800000, reason),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                })
                            ])
                            message.channel.bulkDelete(userMessages)
                        }).catch(console.error);
                    } else if (attempts == 10 && member.kickable && parseInt(msgCount) === LIMIT) {
                        await db.add(`attempts_${message.guild.id}_${message.author.id}`, 1)
                        reason = "[AutoMod] Kicked for Spamming!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                }),
                                member.kick(reason)
                            ])

                            message.channel.messages.fetch({ limit: LIMIT }).then(message => {
                                const userMessages = messages.filter(msg => msg.author.id === message.author.id);
                                message.channel.bulkDelete(userMessages)
                        }).catch(console.error);
                    } else if (attempts == 11 && member.bannable && parseInt(msgCount) === LIMIT) {
                        await db.delete(`attempts_${message.guild.id}_${message.author.id}`)
                        reason = "[AutoMod] Banned for Spamming!"
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("**Moderation Report**")
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
                                member.send({ embeds: [embed] }).catch(() => { return; }),
                                message.channel.send({ embeds: [embed] }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        })
                                    }, 5000);
                                }),
                                message.channel.send(`:warning: **ALERT** | Anti-Abuse is in affect! Spamming to gain levels will be ignored!`).then(msg => {
                                    setTimeout(() => {
                                        msg.delete().catch(() => {
                                            return;
                                        });
                                    }, 5000);
                                }),
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
                    lastMessage: message,
                    timer: fn
                });
                if (!(await db.get(`Levels_${message.guild.id}_${message.author.id}`))) {
                    await db.set(`Levels_${message.guild.id}_${message.author.id}`, {coins: 0, xp: 0, level: 0})
                }
                let xp = await db.get(`Levels_${message.guild.id}_${message.author.id}.xp`)
                let level = await db.get(`Levels_${message.guild.id}_${message.author.id}.level`)
                if (level == 15) return;

                let NeededXP = level * level * 100
                
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
                    });
                    let findRole = (`Level ${newlevel}`).toLowerCase();
                    const role = message.guild.roles.cache.find(r => r.name.toLowerCase().includes(findRole));
                    const botHighestRole = message.guild.members.me.roles.highest;
                    const member = message.guild.members.cache.get(message.author.id);

                    if (role && member && xp && level) {
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
        } catch (error) {
            console.log(error)
        }
    }
    // -----------------------------------------------[ END OF AUTO-MOD ANTI-SPAM ABUSE ]--------------------------------------
    // ---------------------------------------[ Command Execute ]-------------------------------------------
    const prefix = '-'
    if (!message.content.startsWith(prefix) || message.author.bot) return
    if (!message.guild) return

    const args = message.content.slice(prefix.length).split(/ +/g)
    const command = args.shift().toLowerCase()

    if (!bot.commands.has(command)) return

    bot.commands.get(command).execute(bot, message, args)
    // ---------------------------------------[ End of Command Execute ]-----------------------------------------
}
