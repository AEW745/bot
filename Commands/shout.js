const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const noblox = require('noblox.js')
require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Shout',
    description: 'Send a Shout to the Roblox Group!',
    data: new SlashCommandBuilder()
    .setName('shout')
    .setDescription('Send a Shout to the Roblox Group!')
    .addStringOption(option =>
        option.setName('message')
        .setDescription('Send a Shout message to the Roblox Group!')
        ),
        /**
         * 
         * @param {Client} bot
         * @param {Message} message
         * @param {String[]} args
         */
        async execute(bot, message, args) {},

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
            const shoutmessage = interaction.options.getString('message')
            try {
                let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await noblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                  console.log(err)
                })
                console.log((await noblox.getAuthenticatedUser()).name)
                noblox.shout(groupid, shoutmessage || "").then(async () => {
                interaction.editReply({ content: `Successfully Posted Shout to the Roblox Group!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )
    let avatar = await noblox.getPlayerThumbnail(`${(await noblox.getAuthenticatedUser()).id}`, "48x48", "png", true, "headshot");
      let avatarurl = avatar[0].imageUrl;
              let embed = new EmbedBuilder()
                  .setTitle(`**Rank Management!**`)
                  .setDescription(`**Username:**\n${(await noblox.getAuthenticatedUser()).name}\n**UserId:**\n${(await noblox.getAuthenticatedUser()).id}\n**Rank Management Type:**\nShout\n**Shout Message:**\n${shoutmessage || '""'}\n**Command Used By:**`)
                  .setColor('Green')
                  .setAuthor({ name: `${(await noblox.getAuthenticatedUser()).name}`, iconURL: avatarurl })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
              interaction.channel.send({ embeds: [embed] }).then(message => {
                setTimeout(() => {
                  message.delete().catch(() => {
                    return;
                  })
              }, 5000)
          })
        }).catch(() => {
          interaction.editReply({ content: `:x: **ERROR** | Message moderated by Roblox!\n**This message will Auto-Delete in 10 seconds!**`}).then(
            setTimeout(() => {
              interaction.deleteReply().catch(() => {
                return;
              })
          }, 10000)
            )
        })
            } catch (error) {
                interaction.editReply({ content: `:x: **ERROR** | Failed to Post Shout to Roblox Group!\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
                return;
              })
        }, 10000)
        )
                return;
            }
        },
}
