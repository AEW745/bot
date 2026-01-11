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

const roblox = require('noblox.js')
require('dotenv').config();
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'Verify',
    description: 'Verifies a member in the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verifies a member in the Roblox Group.')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('What is your Roblox Username?').setRequired(true)
        .setAutocomplete(true)
        )
    .addStringOption(option =>
        option.setName('method')
        .setDescription('Choose the method to verify!').setRequired(true)
        .addChoices(
            {
              name: "Game",
              value: 'true'
            },
            {
              name: "Code",
              value: 'false'
            }
        )
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
            try {
            let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`**:x: ERROR** | This a ROBLOX Command. Roblox Commands haven't been setup! Please ask the Owner to setup the bot for Roblox Commands!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )
            const username = interaction.options.getString('username')
            const method = interaction.options.getString('method')
            const nickname = interaction.options.getString('nickname')
            function Generate() {
           let tokenID = [];
           let randomstuff = ['cat', 'dog', 'cow', 'pig', 'rabbit', 'turtle', 'sheep'];
           for (let x = 1; x <= 6; x++) {
           tokenID.push(randomstuff[Math.floor(Math.random() * randomstuff.length)]);
           }
           return tokenID.join(' ');
            }
            const string = Generate();
            
            try {
                let id;
                let rank;
                let role1;
                if (method === 'false') {
                    //if (method === 'false') return interaction.editReply(`:warning: | **Code Verification has been disabled due to potential bugs! Please use the Game Verification Method!**`)
                try {
                    let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                    await roblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                        console.log(err)
                    })
                    id = await roblox.getIdFromUsername(username)
                    rank = await roblox.getRankInGroup(groupid, id)
                    role1 = await roblox.getRole(groupid, rank)
                } catch (error) {
                    return interaction.editReply({ content: `**${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch((err) => {
                                return;
                            })
                        }, 10000)
                )
                }
                
                if (username) {
                    let embed = new EmbedBuilder()
                    .setTitle(`**${interaction.guild.name} Verification!**`)
                    .setColor('Yellow')
                    .setDescription(`Hello ${username}, To continue with your Roblox Verification. Please enter the following code into your Roblox Status or Bio:\n` + '**```' + `${string}` + '```**')
                    .setFooter({ text: `After you've entered your code please come back and click done | This message will Auto-Delete in 1 minute!`, })
                    .setTimestamp(Date.now())
                 interaction.editReply({ embeds: [embed], components: [ new ActionRowBuilder().setComponents( new ButtonBuilder().setCustomId('done').setLabel('done').setStyle(ButtonStyle.Success))]  }).then(
                 setTimeout(() => {
                    interaction.deleteReply().catch((err) => {
                        return;
                    })
                }, 60000)
            )
                }

                const filter = interaction => interaction.customId === 'done' && interaction.user.id === interaction.member.id;

const collector = interaction.channel.createMessageComponentCollector(filter, { time: 1500 });


    collector.on('collect', async i => {
        try {
        await i.deferReply({ephemeral: true});
        let rblx = await db.get(`RobloxInfo_${i.guild.id}_${i.member.user.id}.robloxusername`);
        let embed4 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Yellow')
                .setDescription(`Hello ${rblx}, You are already Verified!`)
                .setFooter({ text: `You can only verify once! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
       if (rblx) return i.editReply({ embeds: [embed4], components: []}).then(
        setTimeout(() => {
          i.deleteReply().catch((err) => {
            return;
        })
      }, 5000)
  )
        await roblox.getIdFromUsername(username).then(async foundUser => {
            const UserId = foundUser;
            const name = await roblox.getUsernameFromId(UserId);
        let information = await roblox.getBlurb(UserId)
            if (information.includes(string)) {
                let embed2 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Green')
                .setDescription(`Hello ${name}, You have been successfully Verified!`)
                .setFooter({ text: `Enjoy your stay! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
                await i.editReply({ embeds: [embed2], components: [] }).then(
                    setTimeout(() => {
                      i.deleteReply().catch((err) => {
                        return;
                    })
                  }, 5000)
              )
              await db.set(`RobloxInfo_${i.guild.id}_${i.member.user.id}`, { discordid: i.member.user.id, robloxid: UserId, robloxusername: username })
              
                let embed3 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Blue')
                .setDescription(`Hello ${name}, You have been verified but Unable to Update your nickname do to lack of Permissions!`)
                .setFooter({ text: `Enjoy the Server! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
                let findRole = "Verified"
          let findRole2 = role1.name

          const role = await i.guild.roles.cache.find(r => r.name.includes(findRole))
          const role2 = await i.guild.roles.cache.find(r => r.name.includes(findRole2))

          const botHighestRole = i.guild.members.me.roles.highest;

          if (i.member && (role || role2)) {
            const rolesToAdd = [];
        
            // Check if the member already has the roles
            if (!i.member.roles.cache.has(role.id)) {
                if (role.position < botHighestRole.position) {
                    rolesToAdd.push(role.id);
                }
            }
        
            if (role2) {
            if (!i.member.roles.cache.has(role2.id)) {
                if (role2.position < botHighestRole.position) {
                    rolesToAdd.push(role2.id);
                }
            }
        } else {
            i.editReply(`Please join the Roblox group to get group role! I was only able to give you the Verified Role for now!\nIf you join Roblox group please /unverify and do /verify again!`)
        }
        
            // Add roles if there are any to add
            if (rolesToAdd.length > 0) {
                await i.member.roles.add(rolesToAdd);
            }
        }
                if (!i.member.manageable) return i.editReply({ embeds: [embed3], components: []}).then(
                    setTimeout(() => {
                      i.deleteReply().catch((err) => {
                        return;
                    })
                  }, 5000)
              )
              if (nickname.length < 32) {
                i.member.setNickname(nickname)
              } else {
                const robloxname = await roblox.getUsernameFromId(UserId)
                i.member.setNickname(robloxname)
              }
            } else {
                let embed2 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Red')
                .setDescription(`Hello ${name}, We were unable to verify your Account!`)
                .setFooter({ text: `Please try again later! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
              await i.editReply({ embeds: [embed2], components: []}).then(
              setTimeout(() => {
                i.deleteReply().catch((err) => {
                    return;
                })
            }, 5000)
        )
            }
        }).catch(() => {
          i.editReply(`Please try again couldn't find this user!`).then(
            setTimeout(() => {
                i.deleteReply().catch((err) => {
                    return;
                })
            }, 5000)
          )
        })
    } catch (err) {
        return;
    }
    });
} else {
    //if (method === 'true') return interaction.editReply(`:warning: | **Game Verification has been disabled due to potential bugs! Please use the Code Verification Method!**`)
    let rblx = await db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}.robloxusername`);
    let embed4 = new EmbedBuilder()
    .setTitle(`**${interaction.guild.name} Verification!**`)
    .setColor('Yellow')
    .setDescription(`Hello ${rblx}, You are already Verified!`)
    .setFooter({ text: `You can only verify once! | This message will Auto-Delete in 5 seconds!`, })
    .setTimestamp(Date.now())
        
if (rblx) return interaction.editReply({ embeds: [embed4], components: []}).then(
setTimeout(() => {
interaction.deleteReply().catch((err) => {
    return;
})
}, 5000)
)
        let gameid = await db.get(`ServerSetup_${interaction.guild.id}.gameid`)
        const userId = await roblox.getIdFromUsername(username);
        const name = await roblox.getUsernameFromId(userId);
let embed = new EmbedBuilder()
.setTitle(`**${interaction.guild.name} Verification!**`)
.setColor('Yellow')
.setDescription(`Hello ${name}, To continue with your Roblox Verification. Please join the following game below:\n**[Roblox Verification](https://www.roblox.com/games/${gameid})**`)
.setFooter({ text: `After you've joined the game and confirmed, you will be Verified | This message will Auto-Delete in 5 minutes!` })
.setTimestamp(Date.now());

interaction.editReply({ embeds: [embed] }).then(() => {
setTimeout(async () => {
    interaction.deleteReply().catch((err) => {
        return;
    })
    await db.delete(`Verification_${interaction.guild.id}_${userId}`)
}, 300000);
});

await db.set(`Verification_${interaction.guild.id}_${userId}`, { discordid: interaction.member.user.id, robloxid: userId });

if (interaction.member.manageable) {
    await db.push(`Verification_${interaction.guild.id}_${userId}.discordnick`, nickname)
}
}
            } catch (err) {
                console.log(err)
            }
            } catch (err) {
                console.log(err)
            }
        }
    }