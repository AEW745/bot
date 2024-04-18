const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    PermissionsBitField
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'Resetspam',
    description: `Resets a member's spam attempts to null!`,
    data: new SlashCommandBuilder()
    .setName('resetspam')
    .setDescription(`Resets a member's spam attempts to null!`)
    .addUserOption(option =>
        option.setName('username')
        .setDescription('User to Reset Spam Attempts').setRequired(true)
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
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.editReply(`:x: **ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (interaction.member.user === username) return interaction.editReply(`:x: **ERROR** | You can't Reset your own spam attempts!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )
                if (username) {
                  bot.db.delete(`attempts_${interaction.guild.id}_${username.id}`)
                  interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Resetted **${username}** spam attempts in the Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
