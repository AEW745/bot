const { Client, EmbedBuilder, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { SoundcloudExtractor } = require('discord-player-soundcloud');

 
const { registerExtractors, initPlayer } = require("../utils/registerExtractors");

const { QuickDB } = require("quick.db");
const db = new QuickDB();

const { Logger } = require("@hammerhq/logger");
const pogger = new Logger();

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const bodyParser = require('body-parser');

const roblox = require('noblox.js');


/**
 * 
 * @param {Client} bot 
 */
module.exports.execute = async (bot) => {
console.log(`Bot is online! Logged in as: ${bot.user.tag}`)
const player = await initPlayer(bot);
bot.player = player
await registerExtractors(player);
bot.player.extractors.register(SoundcloudExtractor)

const guilds = [...bot.guilds.cache.values()]; // turn cache into an array

// Map each guild to a Promise that resolves with either the guild data or null
const results = await Promise.all(
    guilds.map(async (guild) => {
        const [RobloxCookie, Group, MinRank] = await Promise.all([
            db.get(`ServerSetup_${guild.id}.rblxcookie`),
            db.get(`ServerSetup_${guild.id}.groupid`),
            db.get(`ServerSetup_${guild.id}.minrank`)
        ]);

        if (RobloxCookie && Group && MinRank) {
            return { guild, RobloxCookie, Group, MinRank };
        }
        return null; // not valid
    })
);

// Filter out null results
const validGuilds = results.filter(Boolean);
// Now process only the valid guilds
for (const { guild, RobloxCookie, Group } of validGuilds) {
if (RobloxCookie && Group) {
await roblox.setCookie(RobloxCookie, guild.id).then(async(success) => { // Required if the group's shout is private
  if (success) {
console.log(`${(await roblox.getAuthenticatedUser()).name} Logged in.`);
      
bot.user.setPresence({ activities: [{ name: `Watching ${bot.guilds.cache.size} servers!`, type: ActivityType.Watching }], status: 'dnd'})
      
//----------------------------------------Roblox Group Logs---------------------------------------------------------------------------------------------------------------------------
const RobloxGroup = await db.get(`ServerSetup_${guild.id}.groupid`);
const RobloxShouts = await db.get(`LogsSetup_${guild.id}.shoutchannel`)
let onShout = roblox.onShout(Number(RobloxGroup));
if ((RobloxGroup && RobloxShouts)) {
onShout.on('data', async function(post) {
    const group = await roblox.getGroup(Number(RobloxGroup)).catch(() => {
      return
    })
    if (!group) return
    let groupName = group.name;
  if (!post.poster) return;
let avatar = await roblox.getPlayerThumbnail(post.poster.userId, "48x48", "png", true, "headshot")
let avatarurl = avatar[0].imageUrl;
const shoutchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${RobloxShouts}`)
const embed = new EmbedBuilder()
.setTitle(`**Group Shout**`)
.addFields(
  {
    name: '**User:**',
    value: `${post.poster.username}`,
    inline: true
  },
  {
    name: '**UserId:**',
    value: `${post.poster.userId}`,
    inline: true
  },
  {
    name: '**Shout Message:**',
    value: `${post.body || '""'}`,
    inline: true
  },
  {
    name: '**Links:**',
    value: `[Group](https://www.roblox.com/groups/${RobloxGroup})\n[Profile](https://www.roblox.com/users/${post.poster.userId}/profile)`,
    inline: true
  }
)
.setAuthor({ name: post.poster.username, iconURL: avatarurl })
.setColor(`Green`)
.setFooter({ text: groupName })
.setTimestamp(Date.now())
shoutchannel.send({ embeds: [embed] })

}); 
 
onShout.on('error', function (err) {
   console.log(err)
});
}

let RobloxCookie = await db.get(`ServerSetup_${guild.id}.rblxcookie`)
let ServerLogs = await db.get(`LogsSetup_${guild.id}.serverlogs`)
let onAudit = roblox.onAuditLog(Number(RobloxGroup), RobloxCookie)
if ((RobloxCookie && ServerLogs)) {
onAudit.on('data', async function(data) {
  const group = await roblox.getGroup(Number(RobloxGroup)).catch(() => {
    return
  });
  if (!group) return;
  let groupName = group.name;
  if (data.actionType === 'Ban Member') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) banned user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Unban Member') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) unbanned user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Remove Member') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) kicked user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Change Rank') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) changed user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s rank from ${data.description.OldRoleSetName} to ${data.description.NewRoleSetName}`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Post Status') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) changed the group shout to "${data.description.Text}"`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Configure Group Game') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) updated [**${data.description.TargetName}**](https://www.roblox.com/universes/configure?id=${data.description.TargetId}):`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Spend Group Funds') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;
        

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const Robux = bot.emojis.cache.get('1230810581779349504')
    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) spent ${Robux}${data.description.Amount} of group funds for: ${data.description.ItemDescription}`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Delete Post') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) deleted post "${data.description.PostDesc}" by user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Delete Ally') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) removed group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId}) as an ally`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Send Ally Request') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) sent an ally request to group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Accept Ally Request') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;
        

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) accepted group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})'s ally request`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Decline Ally Request') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) declined group [**${data.description.TargetGroupName}**](https://www.roblox.com/groups/${data.description.TargetGroupId})'s ally request`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Configure Badge') {
    if (data.description.Type === 0) {
      let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
      let avatarurl = avatar[0].imageUrl;

      const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

      const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) enabled the badge [**${data.description.BadgeName}**](https://www.roblox.com/badges/${data.description.BadgeId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
      logchannel.send({ embeds: [embed] })
    } else if (data.description.Type === 1) {
      let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
      let avatarurl = avatar[0].imageUrl;

      const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

      const embed = new EmbedBuilder()
        .setTitle(`**Group Audit Logs**`)
        .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) disabled the badge [**${data.description.BadgeName}**](https://www.roblox.com/badges/${data.description.BadgeId})`)
        .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
        .setColor(`Red`)
        .setFooter({ text: groupName })
        .setTimestamp(Date.now())
      logchannel.send({ embeds: [embed] })
    }
  } else if (data.actionType === 'Create Items') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created the group item [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Create Group Asset') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created asset [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Update Group Asset') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) created new version ${data.description.VersionNumber} of asset [**${data.description.AssetName}**](https://www.roblox.com/catalog/${data.description.AssetId})`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Accept Join Request') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) accepted user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s join request`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Decline Join Request') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) declined user [**@${data.description.TargetName}**](https://www.roblox.com/users/${data.description.TargetId}/profile)'s join request`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Leave Group') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) left`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  } else if (data.actionType === 'Join Group') {
    let avatar = await roblox.getPlayerThumbnail(data.actor.user.userId, "48x48", "png", true, "headshot")
    let avatarurl = avatar[0].imageUrl;

    const logchannel = bot.guilds.cache.get(`${guild.id}`).channels.cache.get(`${ServerLogs}`)

    const embed = new EmbedBuilder()
      .setTitle(`**Group Audit Logs**`)
      .setDescription(`[**${data.actor.user.displayName}**](https://www.roblox.com/users/${data.actor.user.userId}/profile) joined`)
      .setAuthor({ name: `${data.actor.user.displayName}\n${data.actor.role.name}`, iconURL: avatarurl})
      .setColor(`Red`)
      .setFooter({ text: groupName })
      .setTimestamp(Date.now())
    logchannel.send({ embeds: [embed] })
  }
})

onAudit.on('error', function(err) {
    return;
})
}
}
}).catch(function(error) {
  console.log(error)
})

app.use(express.json());
app.use(cors());


app.get("/verify", async (req, res) => {
    try {
        const UserId = req.query.userid;
        const PlaceId = req.headers['roblox-id'];

        if (!UserId || !PlaceId) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        // Get place info
        const PlaceInfo = await roblox.getPlaceInfo([PlaceId]);
        const RobloxGroup = PlaceInfo[0].builderId;

        // Get all servers linked to this Roblox group
        const matchingGuilds = [];
        for (const guild of bot.guilds.cache.values()) {
            const groupId = await db.get(`ServerSetup_${guild.id}.groupid`);
            if (Number(groupId) === Number(RobloxGroup)) {
                matchingGuilds.push(guild);
            }
        }

        if (!matchingGuilds.length) {
            return res.status(404).json({ error: "No Discord servers linked to this Roblox group" });
        }

        let responseSent = false;
        let responseData = null;

        // Loop through each matching guild
        for (const guild of matchingGuilds) {
            const DiscordId = await db.get(`Verification_${guild.id}_${Number(UserId)}.discordid`);
            const RobloxId = await db.get(`Verification_${guild.id}_${Number(UserId)}.robloxid`);

            if (DiscordId && RobloxId) {
                const user = await guild.members.fetch(DiscordId).catch(() => null);
                if (!user) continue;

                responseData = {
                    RobloxUser: RobloxId,
                    DiscordUser: user.user.username,
                    DiscordId: user.user.id
                };

                if (!responseSent) {
                    res.json(responseData);
                    responseSent = true;
                }
                break; // Found first matching user, stop loop
            }
        }

        if (!responseSent) {
            res.status(404).json({ error: "User not verified in any linked servers" });
        }

    } catch (error) {
        console.error(`Verify Command Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/application", async (req, res) => {
    try {
        const UserId = req.query.userid;
        const Questions = req.query.questions;
        const Answers = req.query.answers;

        if (!UserId || !Questions || !Answers) {
            return res.status(400).json({ error: "Missing query parameters" });
        }

        const QuestionsArray = JSON.parse(Questions);
        const AnswersArray = JSON.parse(Answers);
        const PlaceId = req.headers['roblox-id'];

        if (!PlaceId) {
            return res.status(400).json({ error: "Missing Roblox Place ID" });
        }

        const PlaceInfo = await roblox.getPlaceInfo([PlaceId]);
        const RobloxGroup = PlaceInfo[0].builderId;

        // Find all guilds that use this Roblox group
        const matchingGuilds = [];

        for (const guild of bot.guilds.cache.values()) {
            const groupId = await db.get(`ServerSetup_${guild.id}.groupid`);
            if (Number(groupId) === Number(RobloxGroup)) {
                matchingGuilds.push(guild);
            }
        }

        if (!matchingGuilds.length) {
            return res.status(404).json({ error: "No Discord servers linked to this Roblox group" });
        }

        // Fetch Roblox user info once
        const RobloxUser = await roblox.getUserInfo(Number(UserId));
        const RobloxId = await roblox.getIdFromUsername(RobloxUser.name);
        const avatar = await roblox.getPlayerThumbnail(RobloxId, "48x48", "png", true, "headshot");
        const avatarurl = avatar[0].imageUrl;

        // Loop through each matching guild and send embed
        for (const guild of matchingGuilds) {
            const ServerLogs = await db.get(`LogsSetup_${guild.id}.serverlogs`);
            const logChannel = guild.channels.cache.get(ServerLogs);

            if (!logChannel) continue; // skip if log channel doesn't exist

            const embed = new EmbedBuilder()
                .setTitle(`**YT Mod Application Results!**`)
                .setDescription(`Please review ${RobloxUser.name}'s Application for YT Mod!`)
                .addFields(
                    { name: `**1.** ${QuestionsArray[0][0]}`, value: `**Answer:** ${AnswersArray[0]}`, inline: true },
                    { name: `**2.** ${QuestionsArray[1][0]}`, value: `**Answer:** ${AnswersArray[1]}`, inline: true },
                    { name: `**3.** ${QuestionsArray[2][0]}`, value: `**Answer:** ${AnswersArray[2]}`, inline: true },
                    { name: `**4.** ${QuestionsArray[3][0]}`, value: `**Answer:** ${AnswersArray[3]}`, inline: true },
                    { name: `**5.** ${QuestionsArray[4][0]}`, value: `**Answer:** ${AnswersArray[4]}`, inline: true }
                )
                .setAuthor({ name: `${RobloxUser.displayName}\n${RobloxUser.name}`, iconURL: avatarurl })
                .setColor("Green")
                .setFooter({ text: "Money Developers" })
                .setTimestamp();

            await logChannel.send({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("approve")
                            .setLabel("Approve")
                            .setEmoji("✅")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId("deny")
                            .setLabel("Deny")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Danger)
                    )
                ]
            });
        }

        res.status(200).json({ success: true, message: `Application sent to ${matchingGuilds.length} server(s)` });
    } catch (error) {
        console.error(`Error in /application route: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
    
app.use(bodyParser.urlencoded({ extended: true }));
    
app.post("/confirm", async (req, res) => {
    try {
        const User = parseInt(req.body.userId);
        const DiscordId = req.body.discordId;
        const PlaceId = req.headers["roblox-id"];

        const placeInfo = await roblox.getPlaceInfo([PlaceId]);
        const RobloxGroup = placeInfo[0].builderId;

        const matchingGuilds = [];
        for (const guild of bot.guilds.cache.values()) {
            const groupId = await db.get(`ServerSetup_${guild.id}.groupid`);
            if (Number(groupId) === Number(RobloxGroup)) {
                matchingGuilds.push(guild);
            }
        }

        if (!matchingGuilds.length) {
            return res.status(404).json({ error: "No Discord servers linked to this Roblox group" });
        }

        // Send success response immediately
        res.json({ success: true, message: "success" });

        // PROCESS EACH SERVER
        for (const guild of matchingGuilds) {
            // Check stored verification data
            const storedDiscordId = await db.get(`Verification_${guild.id}_${User}.discordid`);
            const storedRobloxId = await db.get(`Verification_${guild.id}_${User}.robloxid`);
            const nickname = await db.get(`Verification_${guild.id}_${User}.discordnick`);

            // Make sure the verification entry exists for this specific guild
            if (!storedDiscordId || !storedRobloxId) continue;

            // Fetch guild member
            let member;
            try {
                member = await guild.members.fetch(storedDiscordId);
            } catch {
                continue;
            }

            // Wrong Discord user
            if (member.id !== DiscordId) continue;

            // Set nickname if stored
            if (nickname) {
                await member.setNickname(nickname).catch(() => {});
            }

            // Store Roblox info
            const robloxname = await roblox.getUsernameFromId(User);

            await db.set(`RobloxInfo_${guild.id}_${member.id}`, {
                discordid: member.id,
                robloxid: User,
                robloxusername: robloxname
            });

            // Assign roles
            const rank = await roblox.getRankInGroup(RobloxGroup, User);
            const roleName = (await roblox.getRole(RobloxGroup, rank)).name;

            const roleVerified = guild.roles.cache.find(r => r.name.includes("Verified"));
            const roleGroup = guild.roles.cache.find(r => r.name.includes(roleName));
            const botHighest = guild.members.me.roles.highest;

            const rolesToAdd = [];

            if (roleVerified && !member.roles.cache.has(roleVerified.id) && roleVerified.position < botHighest.position) {
                rolesToAdd.push(roleVerified.id);
            }

            if (roleGroup && !member.roles.cache.has(roleGroup.id) && roleGroup.position < botHighest.position) {
                rolesToAdd.push(roleGroup.id);
            }

            if (rolesToAdd.length) {
                await member.roles.add(rolesToAdd).catch(() => {});
            }
        }

    } catch (error) {
        console.error("Confirm Error:", error);
        try {
            return res.status(500).json({ error: "Server Error" });
        } catch {}
    }
});


    
app.get("/ranker", async(req, res) => {
    try {
        const User = req.query.userid;
        const Rank = req.query.rank;
        const PlaceId = req.headers['roblox-id'];
        const PlaceInfo = await roblox.getPlaceInfo([PlaceId]).catch(function(error) {
            console.log(error)
        });
         
        const RobloxGroup = PlaceInfo[0].builderId;
        const groupgames = await roblox.getGroupGames(RobloxGroup, "PUBLIC");
    

        let responseSent = false; // Flag to track whether response has been sent
    
        const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
        if (parseInt(User) && matchesId === true) {
            const rank = await roblox.getRankInGroup(RobloxGroup, User);
            const role = await roblox.getRole(RobloxGroup, rank);
            let newrole = await roblox.getRole(RobloxGroup, parseInt(Rank));
            const groupbot = (await roblox.getAuthenticatedUser()).id;
            const botrank = await roblox.getRankInGroup(RobloxGroup, groupbot);
            const botrole = await roblox.getRole(RobloxGroup, botrank);
                    
            if ((role.rank) <= (botrole.rank) && (role.rank) >= 1) {
                await roblox.setRank(RobloxGroup, parseInt(User), parseInt(newrole.rank)).catch(() => {
                    return;
                })
                res.status(200).json();
                responseSent = true;
            }
        } else {
            res.statusMessage = "Unauthorized | You don't have permission to send this request!";
            res.status(401).json();
            responseSent = true;
        }
    } catch(error) {
        console.error(`Error in processing request: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
    
app.get("/promote", async(req, res) => {
    try {
        const User = req.query.userid;
        const PlaceId = req.headers['roblox-id'];
        const PlaceInfo = await roblox.getPlaceInfo([PlaceId])
        const RobloxGroup = PlaceInfo[0].builderId;
        const groupgames = await roblox.getGroupGames(RobloxGroup, "PUBLIC");
    
        let responseSent = false; // Flag to track whether response has been sent
    
        const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
        if (parseInt(User) && matchesId === true) {
            const rank = await roblox.getRankInGroup(RobloxGroup, parseInt(User));
            const role = await roblox.getRole(RobloxGroup, rank);
            let newrank = role.rank + 1;
            let newrole = await roblox.getRole(RobloxGroup, newrank);
            const groupbot = (await roblox.getAuthenticatedUser()).id;
            const botrank = await roblox.getRankInGroup(RobloxGroup, groupbot);
            const botrole = await roblox.getRole(RobloxGroup, botrank);
            if ((newrole.rank) < (botrole.rank)) {
                await roblox.promote(RobloxGroup, parseInt(User)).catch(() => {
                return;
            })
        res.status(200).json();
        responseSent = true;
        }
        } else {
            res.statusMessage = "Unauthorized | You don't have permission to send this request!"
            res.status(401).json();
            responseSent = true;
        }
    } catch(error) {
        console.error(`Error in processing request: ${error.message}`);
        return res.status(500).type("text/plain").send('Internal Server Error');
    }
});
    
app.get("/demote", async(req, res) => {
    try {
        const User = req.query.userid;
        const PlaceId = req.headers['roblox-id'];
        const PlaceInfo = await roblox.getPlaceInfo([PlaceId])
         
        const RobloxGroup = PlaceInfo[0].builderId;
        const groupgames = await roblox.getGroupGames(RobloxGroup, "PUBLIC");
    
        let responseSent = false; // Flag to track whether response has been sent
    
        const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
              if (parseInt(User) && matchesId === true) {
                    const rank = await roblox.getRankInGroup(RobloxGroup, parseInt(User));
                    const role = await roblox.getRole(RobloxGroup, rank);
                    let newrank = role.rank - 1;
                    let newrole = await roblox.getRole(RobloxGroup, newrank);
                if ((newrole.rank) >= 1){
                    await roblox.demote(RobloxGroup, parseInt(User)).catch(() => {
                        return;
                    })
                    res.status(200).json();
                    responseSent = true;
                }
        } else {
            res.statusMessage = "Unauthorized | You don't have permission to send this request!"
            res.status(401).json();
            responseSent = true;
        }
    } catch(error) {
        console.error(`Error in processing request: ${error.message}`);
        return res.status(500).type("text/plain").send('Internal Server Error');
    }
});
    
app.get("/shouts", async(req, res) => {
    try {
        const Message = req.query.shout;
        const PlaceId = req.headers['roblox-id'];
        const PlaceInfo = await roblox.getPlaceInfo([PlaceId])
          
        const RobloxGroup = PlaceInfo[0].builderId;
        if (Group.includes(RobloxGroup)) {
           
            await roblox.setCookie(RobloxCookie, false, guild)
            const groupgames = await roblox.getGroupGames(RobloxGroup, "PUBLIC");

            let responseSent = false; // Flag to track whether response has been sent
    
            const matchesId = groupgames.some(item => item.rootPlace.id.toString() === PlaceId)
    
            if (matchesId === true) {
                await roblox.shout(RobloxGroup, Message)
                res.status(200).json();
                responseSent = true
            } else {
                res.statusMessage = "Unauthorized | You don't have permission to send this request!"
                res.status(401).json();
                responseSent = true;
            }
        }
    } catch(error) {
        console.error(`Error in processing request: ${error.message}`);
        return res.status(500).type("text/plain").send('Internal Server Error');
    }
});
}
app.get("/", async(req, res) => {
    res.status(500).type("text/plain").send('Internal Server Error');
})
app.post("/api/chat", async (req, res) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";

    try {
        const messages = [
            { role:"system", content: "You are a helpful assistant bot and you always feel good." },
            { role: "user", content: req.body.message } // frontend sends { message: userText }
        ];

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GPT_API}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages,
                temperature: 0.7,
                max_tokens: 500
            })
        };

        const response = await (await fetch(API_URL, requestOptions)).json();
        res.json({ reply: response.choices[0].message.content });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
}

app.listen(port, () => {
    pogger.success(`[SERVER]`, `Server is Ready!`, ` App Listening to: https://localhost:${port}`)
})
}