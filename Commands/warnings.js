const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    Guild,
    GuildMember,
    PermissionsBitField
} = require('discord.js')

const db = require('quick.db')
const { SlashCommandBuilder, userMention } = require('@discordjs/builders')

module.exports = {
    name: 'Warnings',
    description: `Get a member's Warnings in the Discord Server!`,
    data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription(`Get a member's Warnings in the Discord Server!`)
    .addUserOption(option =>
        option.setName('username')
        .setDescription('User for Warnings').setRequired(true)
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
          let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const username = interaction.options.getUser('username');
            try {
                if (username) {
                  if (bot.user === username) return interaction.editReply(`:x: **ERROR** | I don't have Warnings!\n**This message will Auto-Delete in 10 seconds!**`).then(
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                }, 10000)
                  )
                  if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                }, 10000)
                  )
                  if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.editReply(`:x:**ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                }, 10000)
                  )
                  if (interaction.member.user.bot = username.bot) { 
                  await interaction.editReply(`:x: **ERROR** | Other Bots don't have Warnings!\n**This message will Auto-Delete in 10 seconds!**`).then(
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                }, 10000)
                  )
                  } else {
          let Warnings = bot.db.get(`userWarnings_${interaction.guild.id}_${username.id}.warnings`);
          let Reasons = bot.db.get(`userWarnings_${interaction.guild.id}_${username.id}.reasons`);
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** Successfully got **${username}** Warnings in the ${interaction.guild.name} Server!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                  return;
                })
            }, 10000)
            )
              let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Tag:**\n${username.tag}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nGet User's Warnings\n**Number of Warnings:**\n${Warnings || 0}\n**Reasons:**\n${Reasons || 'None'}\n**Moderator:**`)
                  .setColor('White')
                  .setAuthor({ name: username.username, iconURL: username.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                  interaction.channel.send({ embeds: [embed] }).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
                  }, 5000)
              })
                  }} else {
                interaction.editReply({ content: `:x: **ERROR** | Failed to Warn **${username}** in the ${interaction.guild.name} Server!\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
              return;
            })
        }, 10000)
        )
        }
            } catch (error) {
                console.log(error.message)
            }
        },
}
