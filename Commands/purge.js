const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    PermissionsBitField,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Purge',
    description: 'Purge Messages in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge Messages in the Discord Server!')
    .addIntegerOption(option =>
        option.setName('value')
        .setDescription(`Number of Messages to Purge over 3 and less than 100 messages and can't be older than 14 days!`).setRequired(true)
        )
      .addStringOption(option =>
        option.setName('reason')
          .setDescription(`Reason for Purging Messages`)
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
            if (!interaction.member.permissions.has([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
              setTimeout(() => {
                  if (interaction) {
                  interaction.deleteReply()
                  }
              }, 10000)
            )
            if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
              setTimeout(() => {
                  if (interaction) {
                  interaction.deleteReply()
                  }
              }, 10000)
            )
            const value = interaction.options.getInteger('value');
            const reason = interaction.options.getString('reason') || "No Reason Provided!";
            try {
               ;(await interaction.channel.messages.fetch({ limit: 1, before: interaction.channel.lastMessageId})).find(message => {
                 if (value){
                 if (value <= 3) return interaction.editReply(`You can delete ${value} without this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                }, 10000)
                  )
                  if (value > 100) return interaction.editReply(`You can't Purge ${value} messages due to Discord's Bulk delete limits!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )
                 } interaction.channel.bulkDelete(value, true).then(messages => {
                      if (value) {
                   if (messages) {
                     
                     let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Moderation Type:**\nPurge Messages\n**Number of Deleted Messages:**\n${messages.size}\n**Reason:**\n${reason}\n**Moderator:**`)
                  .setColor('Purple')
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                     if (value > messages.size && messages.size > 1) return interaction.editReply({content: `:warning: **WARNING** | Only **${messages.size}** messages were deleted because the other ${value - messages.size} messages are older than **14** Days!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                      setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                          return;
                        })
                    }, 10000)
                      ) &&  interaction.channel.send({ embeds: [embed] }).then(message => {
                        setTimeout(() => {
                          message.delete().catch(() => {
                            return;
                          })
                      }, 5000)
                  })
                   if ((new Date().getTime() - message.createdAt.getTime() > 1209600000) && value > messages.size && messages.size == 0) return interaction.editReply({content: `:x: **ERROR** | **No** Messages were deleted because the messages you tried to delete are older than **14** Days!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )

                       interaction.editReply({content: `:white_check_mark: **SUCCESS** | Successfully Purged **${messages.size}** messages from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
        })
        setTimeout(() => {
          interaction.deleteReply().catch(() => {
            return;
          })
      }, 10000)
                     interaction.channel.send({ embeds: [embed] }).then(message => {
                      setTimeout(() => {
                        message.delete().catch(() => {
                          return;
                        })
                    }, 5000)
                })
                    
                   }
                } else {
                  interaction.editReply({ content: `:x: **ERROR** | Failed to Purge **${messages.size}** messages from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
        setTimeout(() => {
          interaction.deleteReply().catch(() => {
            return;
          })
      }, 10000)
        )
                }
                 }
                   );
               
               }
                 )
                
            } catch (error) {
                console.log(error)
            }
        },
}
