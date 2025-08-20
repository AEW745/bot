const { Client, EmbedBuilder } = require('discord.js');
const {QuickDB} = require('quick.db')
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, message) => {
    // Message Delete
  let serverlogs = await db.get(`LogsSetup_${message.guildId}.serverlogs`)
  let attachments = await message.attachments.map(attachment => attachment.url);
  if (message.author.bot) return;
  if (serverlogs) {
    if (message.content) {
    const logchannel = bot.guilds.cache.get(`${message.guild.id}`).channels.cache.get(`${serverlogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Server Audit Logs**`)
    .setDescription(`${message.author} deleted a message: **${message.content}** in the ${message.guild.name} server!`)
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
    .setColor(`Red`)
    .setFooter({ text: message.guild.name })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
    } else if (message.attachments.size > 0) {
      const logchannel = bot.guilds.cache.get(`${message.guild.id}`).channels.cache.get(`${serverlogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Server Audit Logs**`)
    .setDescription(`${message.author} deleted a message: **${attachments.join(" , ")}** in the ${message.guild.name} server!`)
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
    .setColor(`Red`)
    .setFooter({ text: message.guild.name })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
    } else if (message.content && message.attachments.size > 0) {
      const logchannel = bot.guilds.cache.get(`${message.guild.id}`).channels.cache.get(`${serverlogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Server Audit Logs**`)
    .setDescription(`${message.author} deleted a message: **${message.content}**\n\n**${attachments.join(" , ")}** in the ${message.guild.name} server!`)
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL()})
    .setColor(`Red`)
    .setFooter({ text: message.guild.name })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
    }
  }
// End of Message Delete
}