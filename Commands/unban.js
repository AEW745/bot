const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    Guild,
    PermissionsBitField
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Unban',
    description: 'Unban a member in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a member in the Discord Server!')
    .addStringOption(option =>
        option.setName('userid')
        .setDescription('Userid to Unban').setRequired(true)
        )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('Reason for UnBan')),
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
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            if (!interaction.member.permissions.any([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
              setTimeout(() => {
                  if (interaction) {
                  interaction.deleteReply()
                  }
              }, 10000)
            )
            if (!interaction.guild.members.me.permissions.any([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | I don't have permission to perform this action!\n**This message will Auto-Delete in 10 seconds!**`).then(
              setTimeout(() => {
                  if (interaction) {
                  interaction.deleteReply()
                  }
              }, 10000)
            )
            const userid = interaction.options.getString('userid');
            const reason = interaction.options.getString('reason') || "No Reason Provided!";
            try {
              await interaction.guild.bans.fetch()
            .then(async bans => {
              if (bans.size == 0) return await interaction.editReply({ content: `There aren't any Users to Unban!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )
              let BannedId = bans.find(ban => ban.user.id == userid);
              if (!BannedId) return await interaction.editReply({ content: `:x: **ERROR** | Can't find User! Did you provide a Valid UserID or is the User Unbanned\n**This message will Auto-Delete in 10 seconds!**`}).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )
                if (userid && reason) {
                interaction.guild.bans.remove(userid, reason)
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Unbanned **<@${userid}>** from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                  return;
                })
            }, 10000)
            )
                  let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Username:**\n${(await interaction.guild.bans.fetch(userid)).user.username}\n**Discriminator:**\n${(await interaction.guild.bans.fetch(userid)).user.discriminator}\n**User Tag:**\n${(await interaction.guild.bans.fetch(userid)).user.tag}\n**User Mention:**\n${(await interaction.guild.bans.fetch(userid)).user}\n**UserId:**\n${userid}\n**Moderation Type:**\nUnBan User\n**Reason:**\n${reason}\n**Moderator:**`)
                  .setColor('Green')
                  .setAuthor({ name: (await interaction.guild.bans.fetch(userid)).user.username, iconURL: (await interaction.guild.bans.fetch(userid)).user.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                  interaction.channel.send({ embeds: [embed] }).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
                  }, 5000)
              })
        } else {
                interaction.editReply({ content: `:x: **ERROR** | Failed to Unban **<@${userid}>** from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
              return;
            })
        }, 10000)
        )
        }
              })
            } catch (error) {
                console.log(error)
            }
        },
}
