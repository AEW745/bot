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

const { QuickDB } = require("quick.db");
const db = new QuickDB();
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
          //let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            /*if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )*/
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
                  if (!interaction.member.permissions.has([PermissionsBitField.Flags.KickMembers])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                }, 10000)
                  )
                  if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.KickMembers])) return interaction.editReply(`:x:**ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
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
                    let warnData = await db.get(`userWarnings_${interaction.guild.id}_${username.id}`);

                    if (!Array.isArray(warnData)) {
                      warnData = [];
                    }
                    
                    let combinedWarnings;
                    for (const id of warnData) {
                      let warning = await db.get(`userWarnings_${interaction.guild.id}_${username.id}_${id}`)
                      if (!Array.isArray(combinedWarnings)) {
                        combinedWarnings = [];
                      }
                      if (warning) {
                        combinedWarnings.push(warning)
                      }
                    }
                    
                    const formattedWarnings = warnData.length > 0
                    ? combinedWarnings.map((warning, index) => {
                      // Combine the reasons array into a single string
                      const reason = Array.isArray(warning.reason) ? warning.reason.join(', ') : warning.reason;
                      const moderator = Array.isArray(warning.moderator) ? warning.moderator.join(', ') : warning.moderator;
                  
                      // Format the warning data
                      return `${index + 1} - Moderator: <@${moderator}> - Reason: ${reason} - WarningID: ${warning.warningid}`;
                  })
                  : ['None'];
          let Warnings = warnData.length > 0 ? warnData.length : 0;
          let Reasons = Warnings > 0 ? formattedWarnings.join("\n\n") : 'None';
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
                  .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nGet User's Warnings\n**Number of Warnings:**\n${Warnings}\n**Reasons:**\n${Reasons}\n**Moderator:**`)
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
                console.log(error)
            }
        },
}
