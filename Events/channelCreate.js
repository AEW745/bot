const { Client, AuditLogEvent, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, channel) => {
        let serverlogs = await db.get(`LogsSetup_${channel.guild.id}.serverlogs`)
        if (serverlogs) {
          // Get the audit log entries for unban actions
    const auditLogs = await channel.guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelCreate
    });
  
    // Find the latest unban action by the user who triggered it
    const channelLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000);
          if (channelLog) {
        const { executor } = channelLog;
        const logchannel = bot.guilds.cache.get(`${channel.guild.id}`).channels.cache.get(`${serverlogs}`)
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} created "**${channel.name}**" channel for the ${channel.guild.name} server!`)
        .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: channel.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] })
        }
      }
}