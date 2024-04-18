const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const openai = require("../utils/openAi");

module.exports = {
    name: 'ChatGPT',
    description: 'Responds to messages using AI',
    data: new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Responds to messages using AI')
    .addStringOption(option =>
        option.setName('message')
        .setDescription('Message to send to Chat GPT')
        .setRequired(true)),
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
            await interaction.deferReply({ephemeral: false});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            let message = interaction.options.getString('message')
        try {
            if (interaction.member.user.bot) return;
            await interaction.channel.sendTyping();
            const messages = [
                { 
                    role: "system", 
                    content: "Search the web for answers to a user's question.",
                },
                {
                    role: "user",
                    content: message,
                },
            ];
        
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            });
            console.log(completion)
            const advice = `${completion.choices[0].message.content}\n\nThis is an automated message from Chat GPT.\n\nCredits: Epicwarrior(@AEW745)\n\nSincerely,\nEpicwarrior\nBot Creator`;
            interaction.deleteReply()
            await interaction.channel.send(advice).then(message => {
                setTimeout(() => {
                    message.delete().catch(() => {
                        return;
                    });
                }, 600000)     
            }           
            )
    } catch (err) {
        console.log(err.message)
        interaction.editReply({ content: `:x: **ERROR** | Reached monthly limit for requests!`})
    }
        },
}
