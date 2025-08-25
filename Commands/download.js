const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    AttachmentBuilder,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Download',
    description: 'Allows you to download the games that the bot uses.',
    data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Allows you to download the games that the bot uses.')
    .addStringOption(option =>
        option.setName('games')
        .setDescription('Choose the method to verify!').setRequired(true)
        .addChoices(
            {
              name: "Verification Game",
              value: './Downloads/Roblox Verification.rbxl'
            },
            {
              name: "Rank Management Center Game",
              value: './Downloads/Rank Management Center.rbxl'
            },
            {
                name: "Application Center Game",
                value: './Downloads/Application Center.rbxl'
            },
        )
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
            await bot.application.fetch();
            await interaction.deferReply({ephemeral: true});
            if (interaction.member.id !== interaction.guild.ownerId || interaction.member.id !== bot.application.owner.id) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000)
            )
            const game = interaction.options.getString('games')
            try {
           if (game === './Downloads/Roblox Verification.rbxl') {
            const attachment = new AttachmentBuilder(game, { name: 'Roblox Verification.rbxl'})
            interaction.editReply({content: `:white_check_mark: **SUCCESS** | Game Download has been sent!\n\n**This is only for using the Bot with Roblox!**`, files: [attachment]})
           } else if (game === './Downloads/Rank Management Center.rbxl') {
            const attachment = new AttachmentBuilder(game, { name: 'Rank Management Center.rbxl'})
            interaction.editReply({content: `:white_check_mark: **SUCCESS** | Game Download has been sent!\n\n**This is only for using the Bot with Roblox!**`, files: [attachment]})
           } else {
            const attachment = new AttachmentBuilder(game, { name: 'Application Center.rbxl'})
            interaction.editReply({content: `:white_check_mark: **SUCCESS** | Game Download has been sent!\n\n**This is only for using the Bot with Roblox!**`, files: [attachment]})
           }
    } catch (err) {
        console.log(err)
    }
        },
}
