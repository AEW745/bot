const {Client, AuditLogEvent, EmbedBuilder} = require('discord.js')
const {QuickDB} = require('quick.db');
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, user) => {
    // Guild Ban Remove
          let serverlogs = await db.get(`LogsSetup_${user.guild.id}.serverlogs`)
          if (serverlogs) {
            // Get the audit log entries for unban actions
        const auditLogs = await user.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberBanRemove
        });
      
        // Find the latest unban action by the user who triggered it
        const unbanLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000)
      
        if (unbanLog) {
          const { executor } = unbanLog;
          const logchannel = bot.guilds.cache.get(`${user.guild.id}`).channels.cache.get(`${serverlogs}`)
          const embed = new EmbedBuilder()
          .setTitle(`**Server Audit Logs**`)
          .setDescription(`${executor} removed ban for <@${user.user.id}> from ${user.guild.name}`)
          .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL()})
          .setColor(`Red`)
          .setFooter({ text: user.guild.name })
          .setTimestamp(Date.now())
          logchannel.send({ embeds: [embed] })
          }
        }
  // End of Guild Ban Remove
}