const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    Guild,
    GuildMember,
    PermissionsBitField,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'DelTimeout',
    description: 'Remove Timeout from a member in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('deltimeout')
    .setDescription('Remove Timeout from a member in the Discord Server!')
    .addUserOption(option =>
        option.setName('username')
        .setDescription('User to Remove Timeout').setRequired(true)
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
            await interaction.deferReply({ephemeral: true});
            const username = interaction.options.getUser('username')
            let duration = null;
            try {
                if (!interaction.member.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
              if (username && interaction.options.getMember('username').moderatable && interaction.options.getMember('username').communicationDisabledUntil) {
                let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Tag:**\n${username.tag}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nRemove Timeout\n**Moderator:**`)
                  .setColor('Green')
                  .setAuthor({ name: username.username, iconURL: username.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                interaction.options.getMember('username').timeout(duration)
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Removed **${username}'s** Timeout in the Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
                interaction.editReply({ content: `:x: **ERROR** | Failed to Remove **${username}'s** Timeout in the Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
