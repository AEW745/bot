const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType, useMainPlayer, useQueue } = require('discord-player')

module.exports = {
    name: 'Shuffle',
    description: 'Shuffles songs in the Queue.',
    data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles songs in the Queue.'),
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
            // Inside your slashexecute function
const queue = useQueue(interaction.guildId);

try {
    if (!queue)
        return await interaction.editReply("There aren't any songs currently in the Queue.\n**This message will Auto-Delete in 10 seconds!**").then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                    return;
                  })
            }, 10000)
        );

    queue.tracks.shuffle();

    await interaction.editReply(`The queue of ${queue.tracks.size} songs has been shuffled!\n**This message will Auto-Delete in 5 seconds!**`).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
                return;
              })
        }, 5000)
    );
} catch (err) {
    console.log(err.message);
    interaction.editReply("No Results\n**This message will Auto-Delete in 10 seconds!**").then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
                return;
              })
        }, 10000)
    );
}

        },
}
