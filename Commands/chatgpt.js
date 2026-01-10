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
                    role: "developer",
                    content: ""
                },
                { 
                    role: "system", 
                    content: "MoneyDevsRanker is a smart bot.",
                },
                {
                    role: "user",
                    content: message,
                },
            ];
        
            const completion = await openai.responses.create({
                model: 'gpt-5.2',
                tools: [
                    { type: "web_search" },
                    { type: "image_generation" }
                ],
                tool_choice: 'auto',
                input: messages,
                temperature: 1,
                max_output_tokens: 200,
                store: true,
                safety_identifier: interaction.member.user.username,
            })
            
            if (completion.output[0].status === 'length') return interaction.editReply(`:x: **ERROR** | Your message is too long to generate!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 60000)
            )
            if (completion.output[0].type === 'message') {
            const advice = `${completion.output.at(-1).content[0].text}`;
            interaction.deleteReply()
            await interaction.channel.send(advice).then(message => {
                setTimeout(() => {
                    message.delete().catch(() => {
                        return;
                    });
                }, 600000)     
            }           
            )
        } else if (completion.output[0].type === 'image_generation_call') {
            const imagegeneration = `${completion.output[0].result}`;
            const imagebuffer = Buffer.from(imagegeneration, "base64")
            const attachment = new AttachmentBuilder(imagebuffer);
            interaction.deleteReply()
            await interaction.channel.send({ files: [attachment] }).then(message => {
                setTimeout(() => {
                    message.delete().catch(() => {
                        return;
                    });
                }, 600000)     
            }           
            )
        } else {
            const websearch = `${completion.output.at(-1).content[0].text}`;
            interaction.deleteReply()
            await interaction.channel.send(websearch).then(message => {
                setTimeout(() => {
                    message.delete().catch(() => {
                        return;
                    });
                }, 600000)     
            }           
            )
        }
    } catch (err) {
        await interaction.editReply(`:x: **ERROR** | ${err.message}`)
    }
        },
}
