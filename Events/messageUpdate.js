const {Client, EmbedBuilder} = require('discord.js');
const {QuickDB} = require('quick.db');
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, oldMessage, newMessage) => {
    // Message Update
  let serverlogs = await db.get(`LogsSetup_${newMessage.guildId}.serverlogs`)
  if (oldMessage.content === newMessage.content) return;
  if (newMessage.author.bot) return;
  if (serverlogs) {
    const logchannel = bot.guilds.cache.get(`${newMessage.guild.id}`).channels.cache.get(`${serverlogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Server Audit Logs**`)
    .setDescription(`${oldMessage.author} edited a message: **${oldMessage.content}** to **${newMessage.content}** in the ${newMessage.guild.name} server!`)
    .setAuthor({ name: oldMessage.author.username, iconURL: oldMessage.author.displayAvatarURL()})
    .setColor(`Red`)
    .setFooter({ text: newMessage.guild.name })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  }
// End of Message Update
}