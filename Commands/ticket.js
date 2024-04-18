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
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
} = require('discord.js')

const db = require('quick.db');

const { SlashCommandBuilder, userMention } = require('@discordjs/builders')
let count = 0

module.exports = {
    name: 'Ticket',
    description: 'Opens a ticket in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Opens a ticket in the Discord Server!')
    .addStringOption(option =>
        option.setName('subject')
        .setDescription('Topic of your ticket')),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
          let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const subject = interaction.options.getString('subject') || "No Subject Given!";
            let ticketchannel = bot.db.get(`LogsSetup_${interaction.guild.id}.ticketchannel`)
            try {
                if (subject) {
                  if (interaction.channel.id === `${ticketchannel}`) {
            count++;
const formattedCounter = count.toString().padStart(3, '0');

const channel = await interaction.guild.channels.create({
  name: `TICKET ${formattedCounter}`,
  type: 0, // Use 'text' for text channels
  parent: interaction.channel.parentId,
});




interaction.editReply(`Ticket has been successfully created for ${interaction.member.user}! Your ticket number is **ticket-${formattedCounter}**`)
channel.permissionOverwrites.set([
  {
    id: interaction.member.id, // User who initiated the command
    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
    deny: ['CreatePublicThreads', 'CreatePrivateThreads'],
  },
  {
    id: interaction.guild.roles.everyone,
    allow: [],
    deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'CreatePublicThreads', 'CreatePrivateThreads'],
  },
  {
    id: bot.user.id,
    allow: ['ViewChannel', 'ManageWebhooks', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'AddReactions', 'ReadMessageHistory', 'UseApplicationCommands'],
    deny: ['CreatePublicThreads', 'CreatePrivateThreads'],
  },
  // Add more permission overwrites as needed for specific roles
]);


           const embed = new EmbedBuilder()
            .setTitle(`ticket-${formattedCounter}`)
            .setAuthor({ name: subject })
            .setDescription(`Thanks for opening a support Ticket! Please describe your issue below and we will do our best to assist you!`)
            .setColor(`Green`)
            .setFooter({ text: interaction.guild.name })

            channel.send({ embeds: [embed], components: [ new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId('close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger)).addComponents( new ButtonBuilder().setCustomId('closewithreason').setLabel('Close with Reason').setEmoji('🗒️').setStyle(ButtonStyle.Danger)).addComponents( new ButtonBuilder().setCustomId('claim').setEmoji('👋').setLabel('Claim').setStyle(ButtonStyle.Success)) ] });
          } else {
            interaction.editReply({ content: `This command can only be used in the Specified Ticket channel.`, ephemeral: true})
          }
                }
            } catch (error) {
                console.log(error.message)
            }
        },
}
