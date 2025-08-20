const { Client, AuditLogEvent, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, user) => {
    // Guild Ban Add
          let serverlogs = await db.get(`LogsSetup_${user.guild.id}.serverlogs`)
          if (serverlogs) {
            const bans = await user.guild.bans.fetch();
        const ban = bans.find((banEntry) => banEntry.user.id === user.user.id);
        const banreason = ban.reason || "No Reason Provided!"
        
        // Get the audit log entries for ban actions
        const auditLogs = await user.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberBanAdd
        });
      
        // Find the latest ban action by the user who triggered it
        const banLog = auditLogs.entries.find(log => Date.now() - log.createdTimestamp < 1000);                                                   
        if (banLog) {
          const { executor } = banLog;
        const logchannel = bot.guilds.cache.get(`${user.guild.id}`).channels.cache.get(`${serverlogs}`)
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`${executor} banned <@${user.user.id}> from ${user.guild.name} for "${banreason}"`)
        .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL()})
        .setColor(`Red`)
        .setFooter({ text: user.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] })
          }
        }
// End of Guild Ban Add
}