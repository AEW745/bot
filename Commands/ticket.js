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
    MessageFlags
} = require('discord.js')

const { QuickDB } = require("quick.db");
const db = new QuickDB();

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
            await interaction.deferReply({flags: MessageFlags.Ephemeral});

            const subject = interaction.options.getString('subject') || "No Subject Given!";
            let ticketchannel = await db.get(`LogsSetup_${interaction.guild.id}.ticketchannel`)
            if (!ticketchannel) return interaction.editReply(`:x: **ERROR** | Ticket Channel hasn't been setup. Please ask the Owner to setup Tickets for this server!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )
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

const allowedPermissions = new PermissionsBitField([
  PermissionsBitField.Flags.ModerateMembers,
  PermissionsBitField.Flags.BanMembers,
  PermissionsBitField.Flags.KickMembers,
  PermissionsBitField.Flags.Administrator,
]);

// Filter roles with any of the desired permissions
const staffRoles = interaction.guild.roles.cache.filter(role =>
  role.permissions.any(allowedPermissions)
);

const overwrites = [
  {
    id: interaction.member.id, // Command initiator
    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'],
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
];

// Add overwrites for each staff role
staffRoles.forEach(role => {
  overwrites.push({
    id: role.id,
    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks', 'ReadMessageHistory', 'UseApplicationCommands', 'AddReactions'],
    deny: ['CreatePublicThreads', 'CreatePrivateThreads'],
  });
});

// Apply the permission overwrites
channel.permissionOverwrites.set(overwrites);

await db.set(`Tickets_${interaction.guild.id}_${interaction.member.user.id}`, { discordid: interaction.member.user.id })


           const embed = new EmbedBuilder()
            .setTitle(`ticket-${formattedCounter}`)
            .setAuthor({ name: subject })
            .setDescription(`Thanks for opening a support Ticket! Please describe your issue below and we will do our best to assist you!`)
            .setColor(`Green`)
            .setFooter({ text: interaction.guild.name })

            channel.send({ embeds: [embed], components: [ new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId('close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger)).addComponents( new ButtonBuilder().setCustomId('closewithreason').setLabel('Close with Reason').setEmoji('🗒️').setStyle(ButtonStyle.Danger)).addComponents( new ButtonBuilder().setCustomId('claim').setEmoji('👋').setLabel('Claim').setStyle(ButtonStyle.Success)) ] });
          } else {
            interaction.editReply({ content: `This command can only be used in the Specified Ticket channel.`, flags: MessageFlags.Ephemeral})
          }
                }
            } catch (error) {
                console.log(error)
            }
        },
}
