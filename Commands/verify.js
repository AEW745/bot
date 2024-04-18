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
            let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const username = interaction.options.getString('username')
            const method = interaction.options.getString('method')
            const nickname = interaction.options.getString('nickname')
            if (nickname.length > 32) return interaction.editReply(`:x: **ERROR** | Your nickname is too long! Please choose Username or Displayname format!`)
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
                try {
                    let groupid = bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                    await noblox.setCookie(bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`))
                    id = await noblox.getIdFromUsername(username)
                    rank = await noblox.getRankInGroup(groupid, id)
                    role1 = await noblox.getRole(groupid, rank)
                } catch (error) {
                    return interaction.editReply({ content: `**${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
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
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 60000)
            )
                }

                const filter = interaction => interaction.customId === 'done' && interaction.user.id === interaction.member.id;

const collector = interaction.channel.createMessageComponentCollector(filter, { time: 1500 });


    collector.once('collect', async i => {
        await i.deferReply({ephemeral: true});
        let embed4 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Yellow')
                .setDescription(`Hello ${username}, You are already Verified!`)
                .setFooter({ text: `You can only verify once! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
        let rblx = bot.db.get(`RobloxInfo_${i.guild.id}_${i.member.id}.robloxusername`);
        let rblx2 = bot.db.get(`Verification_${i.guild.id}_${i.member.id}_${id}.robloxid`)
       if (rblx) return i.editReply({ embeds: [embed4], components: []}).then(
        setTimeout(() => {
          i.deleteReply().catch(() => {
            return;
          })
      }, 5000)
  )
        await noblox.getIdFromUsername(username).then(async foundUser => {
            const UserId = foundUser;
        let information = await noblox.getPlayerInfo(UserId)
            if (information.blurb.includes(string)) {
                let embed2 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Green')
                .setDescription(`Hello ${username}, You have been successfully Verified!`)
                .setFooter({ text: `Enjoy your stay! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
                await i.editReply({ embeds: [embed2], components: [] }).then(
                    setTimeout(() => {
                      i.deleteReply().catch(() => {
                        return;
                      })
                  }, 5000)
              )
              bot.db.set(`RobloxInfo_${i.guild.id}_${i.member.id}`, { discordid: i.member.id, robloxid: UserId, robloxusername: username })
              
                let embed3 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Blue')
                .setDescription(`Hello ${username}, You have been verified but Unable to Update your nickname do to lack of Permissions!`)
                .setFooter({ text: `Enjoy the Server! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
                const member = await i.guild.members.fetch(i.member.id)
                let findRole = "Verified"
                let findRole2 = role1.name
                const role = await i.guild.roles.cache.find(r => r.name.includes(findRole))
                const role2 = await i.guild.roles.cache.find(r => r.name.includes(findRole2))
                if (member && role && role2) {
                await member.roles.add(role.id).catch((err) => {
                    console.log(err.message)
                })
                await member.roles.add(role2.id).catch((err) => {
                    console.log(err.message)
                })
                }
                if (!i.member.manageable) return i.editReply({ embeds: [embed3], components: []}).then(
                    setTimeout(() => {
                      i.deleteReply().catch(() => {
                        return;
                      })
                  }, 5000)
              )
                i.member.setNickname(nickname).catch((err) => {
                    console.log(err.message)
                })
            } else {
                let embed2 = new EmbedBuilder()
                .setTitle(`**${i.guild.name} Verification!**`)
                .setColor('Red')
                .setDescription(`Hello ${username}, We were unable to verify your Account!`)
                .setFooter({ text: `Please try again later! | This message will Auto-Delete in 5 seconds!`, })
                .setTimestamp(Date.now())
              await i.editReply({ embeds: [embed2], components: []}).then(
              setTimeout(() => {
                i.deleteReply().catch(() => {
                    return;
                  })
            }, 5000)
        )
            }
        })
    });
} else {
        let embed4 = new EmbedBuilder()
    .setTitle(`**${interaction.guild.name} Verification!**`)
    .setColor('Yellow')
    .setDescription(`Hello ${username}, You are already Verified!`)
    .setFooter({ text: `You can only verify once! | This message will Auto-Delete in 5 seconds!`, })
    .setTimestamp(Date.now())
        let rblx = bot.db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}.robloxusername`);
if (rblx) return interaction.editReply({ embeds: [embed4], components: []}).then(
setTimeout(() => {
interaction.deleteReply().catch(() => {
    return;
  })
}, 5000)
)
        let gameid = bot.db.get(`ServerSetup_${interaction.guild.id}.gameid`)
        const userId = await noblox.getIdFromUsername(username);

let embed = new EmbedBuilder()
.setTitle(`**${interaction.guild.name} Verification!**`)
.setColor('Yellow')
.setDescription(`Hello ${username}, To continue with your Roblox Verification. Please join the following game below:\n**[Roblox Verification](https://www.roblox.com/games/${gameid})**`)
.setFooter({ text: `After you've joined the game and confirmed, you will be Verified | This message will Auto-Delete in 1 minute!` })
.setTimestamp(Date.now());

interaction.editReply({ embeds: [embed] }).then(() => {
setTimeout(() => {
    interaction.deleteReply().catch(() => {
        return;
      })
    bot.db.delete(`Verification_${interaction.guild.id}_${interaction.member.id}_${userId}`)
}, 60000);
});
console.log(interaction.member.id)
bot.db.set(`Verification_${interaction.guild.id}_${interaction.member.id}_${userId}`, { discordid: interaction.member.id, robloxid: userId });

if (interaction.member.manageable) {
    bot.db.push(`Verification_${interaction.guild.id}_${interaction.member.id}_${userId}.discordnick`, nickname)
}
}
            } catch (err) {
                console.log(err.message)
            }
        }
    }