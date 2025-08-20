const {Client, EmbedBuilder} = require('discord.js');
const {QuickDB} = require('quick.db');
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, member) => {
    // Guild Member Add
    try {
    let serverlogs = await db.get(`LogsSetup_${member.guild.id}.serverlogs`)
        if (serverlogs) {
        const logchannel = bot.guilds.cache.get(`${member.guild.id}`).channels.cache.get(`${serverlogs}`)
        if (logchannel) {
        const embed = new EmbedBuilder()
        .setTitle(`**Server Audit Logs**`)
        .setDescription(`<@${member.user.id}> has joined the ${member.guild.name} server!`)
        .setAuthor({ name: member.user.username, iconURL: member.displayAvatarURL()})
        .setColor(`Green`)
        .setFooter({ text: member.guild.name })
        .setTimestamp(Date.now())
        logchannel.send({ embeds: [embed] })
        }
        }
    // Check if the new member is your bot by comparing user IDs
    if (member.user.id === bot.user.id) {
      bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    } else {
      if (await db.get(`RobloxInfo_${member.guild.id}_${member.user.id}`)) {
          await noblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                console.log(err.message)
              })
              let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
              let id = await db.get(`RobloxInfo_${member.guild.id}_${member.user.id}.robloxid`)
              let rank = await noblox.getRankInGroup(groupid, id).catch((err) => {
                console.log(err.message)
              })
              let role1 = await noblox.getRole(groupid, rank).catch((err) => {
                console.log(err.message)
              })

              let findRole = "Verified"
              let findRole2 = role1.name
    
              const role = await member.guild.roles.cache.find(r => r.name.toLowerCase().includes(findRole))
              const role2 = await member.guild.roles.cache.find(r => r.name.toLowerCase().includes(findRole2))
    
              const botHighestRole = member.guild.members.me.roles.highest;
    
              if (member && role || role2) {
                const rolesToAdd = [];
            
                // Check if the member already has the roles
                if (!member.roles.cache.has(role.id)) {
                    if (role.position < botHighestRole.position) {
                        rolesToAdd.push(role.id);
                    }
                }
            
                if (!member.roles.cache.has(role2.id)) {
                    if (role2.position < botHighestRole.position) {
                        rolesToAdd.push(role2.id);
                    }
                }
            
                // Add roles if there are any to add
                if (rolesToAdd.length > 0) {
                    await member.roles.add(rolesToAdd);
                }
            }
      }
    }
  } catch (err) {
    console.log(err);
  }
// End of Guild Member Add
}