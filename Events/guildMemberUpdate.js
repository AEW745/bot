const { Client, AuditLogEvent, EmbedBuilder } = require('discord.js')
const {QuickDB} = require('quick.db');
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, oldMember, newMember) => {
    // Member update
  let serverlogs = await db.get(`LogsSetup_${oldMember.guild.id}.serverlogs`)
  if (serverlogs) {
    // Get the audit log entries for member changes
    const auditLogs = await oldMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberRoleUpdate
    })

    // Find the latest update member action by the user who triggered it
    const channelLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000)

    if (channelLog) {
      const { executor, target, changes } = channelLog ;
      if (executor === null) return;
      const logchannel = bot.guilds.cache.get(`${oldMember.guild.id}`).channels.cache.get(`${serverlogs}`)
      if (changes[changes.length - 1].key === '$add') {
        changes[changes.length - 1].new.forEach(() => {
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} added <@&${changes[changes.length - 1].new[0].id}> role to ${target} in the ${newMember.guild.name} server!`)
        .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: newMember.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] })
        });
      } else if (changes[changes.length - 1].key === '$remove') {
        changes[changes.length - 1].new.forEach(() => {
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} removed <@&${changes[changes.length - 1].new[0].id}> role from ${target} in the ${newMember.guild.name} server!`)
        .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: newMember.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] })
        });
      }
    }
  }
// End of Member update
}