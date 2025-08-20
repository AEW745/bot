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

const { QuickDB } = require("quick.db");
const db = new QuickDB();

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
            await interaction.deferReply({ephemeral: false});
            let message = interaction.options.getString('message')
        try {
            if (interaction.member.user.bot) return;
            await interaction.channel.sendTyping();
            const messages = [
                { 
                    role: "system", 
                    content: "MoneyDevsRanker is a smart bot.",
                },
                {
                    role: "user",
                    content: message,
                },
            ];
        
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 1,
                max_tokens: 500,
            })
            
            if (completion.choices[0].finish_reason === 'length') return interaction.editReply(`:x: **ERROR** | Your message is too long to generate!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 60000)
            )
            const advice = `${completion.choices[0].message.content}`;
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
        await interaction.editReply(`:x: **ERROR** | ${err.message}`)
    }
        },
}
