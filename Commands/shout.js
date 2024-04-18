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

module.exports = {
    name: 'Shout',
    description: 'Send a Shout to the Roblox Group!',
    data: new SlashCommandBuilder()
    .setName('shout')
    .setDescription('Send a Shout to the Roblox Group!')
    .addStringOption(option =>
        option.setName('message')
        .setDescription('Send a Shout message to the Roblox Group!').setRequired(true)
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
            if (!serversetup) return interaction.editReply(`**:x: ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const shoutmessage = interaction.options.getString('message');
            try {
                let groupid = bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await noblox.setCookie(bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`))
                console.log(await noblox.getCurrentUser("UserName"))
                noblox.shout(groupid, shoutmessage)
                interaction.editReply({ content: `Successfully Posted Shout to the Roblox Group!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
                setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                    return;
                  })
              }, 10000)
                )
    let avatar = await noblox.getPlayerThumbnail(`${await noblox.getCurrentUser("UserId")}`, "48x48", "png", true, "headshot");
      let avatarurl = avatar[0].imageUrl;
              let embed = new EmbedBuilder()
                  .setTitle(`**Rank Management!**`)
                  .setDescription(`**Username:**\n${await noblox.getCurrentUser("UserName")}\n**UserId:**\n${await noblox.getCurrentUser("UserId")}\n**Rank Management Type:**\nShout\n**Shout Message:**\n${shoutmessage}\n**Command Used By:**`)
                  .setColor('Green')
                  .setAuthor({ name: `${await noblox.getCurrentUser("UserName")}`, iconURL: avatarurl })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
              interaction.channel.send({ embeds: [embed] }).then(message => {
                setTimeout(() => {
                  message.delete().catch(() => {
                    return;
                  })
              }, 5000)
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
                console.log(error.message)
            }
        },
}
