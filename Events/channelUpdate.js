const {Client, AuditLogEvent, EmbedBuilder} = require('discord.js')
const { QuickDB } = require('quick.db')
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, oldChannel, newChannel) => {
    // Channel Update
    let serverlogs = await db.get(`LogsSetup_${oldChannel.guild.id}.serverlogs`)
    if (serverlogs) {
      // Get the audit log entries for channel update actions
const auditLogs = await oldChannel.guild.fetchAuditLogs({
  type: AuditLogEvent.ChannelUpdate
});

const channelLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000);

if (channelLog) {
  const { executor, changes } = channelLog;
  if (changes[changes.length - 1].key === 'name') {
    const logchannel = bot.guilds.cache.get(`${oldChannel.guild.id}`).channels.cache.get(`${serverlogs}`)
    const embed = new EmbedBuilder()
    .setTitle(`**Server Audit Logs**`)
    .setDescription(`${executor} updated **${changes[changes.length - 1].old}** channel to **${changes[changes.length - 1].new}** channel for the ${newChannel.guild.name} server!`)
    .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL()})
    .setColor(`Red`)
    .setFooter({ text: newChannel.guild.name })
    .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
      }
    }
  }
// End of Channel Update
}