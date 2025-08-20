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

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Timeout',
    description: 'Timeout a member in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member in the Discord Server!')
    .addUserOption(option =>
        option.setName('username')
        .setDescription('User to Timeout').setRequired(true)
        )
      .addIntegerOption(option =>
        option.setName('duration')
          .setDescription('Duration of Timeout')
            .addChoices(
              {
                name: "1 Minute",
                value: 60000
              },
              {
                name: "5 Minutes",
                value: 300000
              },
              {
                name: "10 Minutes",
                value: 600000
              },
              {
                name: "1 Hour",
                value: 3600000
              },
              {
                name: "1 Day",
                value: 86400000
              },
              {
                name: "1 Week",
                value: 604800000
              }
              )
        .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('Reason for Timeout')),
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
          //let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            /*if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )*/
            if (!interaction.member.permissions.has([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
              setTimeout(() => {
                  if (interaction) {
                  interaction.deleteReply()
                  }
              }, 10000)
            )
            if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | I don't have permission to perform this action!\n**This message will Auto-Delete in 10 seconds!**`).then(
              setTimeout(() => {
                  if (interaction) {
                  interaction.deleteReply()
                  }
              }, 10000)
            )
            const username = interaction.options.getUser('username');
            const duration = interaction.options.getInteger('duration');
            const reason = interaction.options.getString('reason') || "No Reason Provided!";
            try {
                if (username && duration && reason && interaction.options.getMember('username').moderatable) {
                  const addMilliseconds = (date, milliseconds) => {
  const result = new Date(date);
  result.setMilliseconds(result.getMilliseconds() + milliseconds);
  return result.toLocaleString('en-US', {timeZone: 'America/New_York'});
};
                  let date = new Date()
                  let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`) .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nTimeout\n**Reason:**\n${reason}\n**Timedout Until:**\n${addMilliseconds(date, duration)}\n**Moderator:**`)
                  .setColor('Red')
                  .setAuthor({ name: username.username, iconURL: username.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                interaction.options.getMember('username').timeout(duration, reason)
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Timedout **${username}** in the Server!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
              setTimeout(() => {
                interaction.deleteReply().catch(() => {
                  return;
                })
            }, 10000)
              )
                   interaction.channel.send({ embeds: [embed] }).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
                  }, 5000)
              })
        } else {
                interaction.editReply({ content: `:x: **ERROR** | Failed to Timeout **${username}** in the Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
