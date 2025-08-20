const { Client, AuditLogEvent, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, member) => {
    // Guild Member Remove
    try {
    // Check if the removed member is your bot by comparing user IDs
    if (member.user.id === bot.user.id) {
      bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
      if (await db.get(`ServerSetup_${member.guild.id}`)) {
      await db.delete(`ServerSetup_${member.guild.id}`)
      } else if (await db.get(`LogsSetup_${member.guild.id}`)) {
      await db.delete(`LogsSetup_${member.guild.id}`)
      }
    }

    if (member.user.id === bot.user.id) return;
          let serverlogs = await db.get(`LogsSetup_${member.guild.id}.serverlogs`)
          if (serverlogs != null || serverlogs != ""){
                // Get the audit log entries for unban actions
        const auditLogs = await member.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberKick
        });

        // Find the latest unban action by the user who triggered it
        const kickLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000)

          if (kickLog) {
            const { executor, reason } = kickLog;
            const logchannel = bot.guilds.cache.get(`${member.guild.id}`).channels.cache.get(`${serverlogs}`)
            const embed = new EmbedBuilder()
            .setTitle(`**Server Audit Logs**`)
            .setDescription(`${executor} kicked ${member.user} from ${member.guild.name} for ${reason || "No Reason Provided!"}`)
            .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL()})
            .setColor(`Red`)
            .setFooter({ text: member.guild.name })
            .setTimestamp(Date.now())
            logchannel.send({ embeds: [embed] })
          } else {
            const logchannel = bot.guilds.cache.get(`${member.guild.id}`).channels.cache.get(`${serverlogs}`)
            const embed = new EmbedBuilder()
            .setTitle(`**Server Audit Logs**`)
            .setDescription(`<@${member.user.id}> has lefted the ${member.guild.name} server!`)
            .setAuthor({ name: member.user.username, iconURL: member.displayAvatarURL()})
            .setColor(`Red`)
            .setFooter({ text: member.guild.name })
            .setTimestamp(Date.now())
            logchannel.send({ embeds: [embed] })
          }
        }
      } catch (err) {
        console.log(err)
      }
// End of Guild Member Remove
}