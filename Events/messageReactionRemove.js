const {Client} = require('discord.js');
const {QuickDB} = require('quick.db')
const db = new QuickDB()

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, reaction, user) => {
    // Message Reaction Remove
    // Ignore bot reactions
    if (user.bot) return;

    // Fetch the suggestion channel ID from the database
    const suggestionChannelId = await db.get(`LogsSetup_${reaction.message.guild.id}.suggestionchannel`);
    if (!suggestionChannelId) return;

    // Ensure the reaction belongs to the suggestion channel
    if (reaction.message.channel.id !== suggestionChannelId) return;

    try {
        // Fetch all users for the reaction to get accurate data
        await reaction.users.fetch();

        // Filter out bot reactions
        const nonBotUsers = reaction.users.cache.filter(u => !u.bot);

        // Handle ❌ Reactions: Delete the message if it still has 10+ downvotes after removal
            if (reaction.emoji.name === '❌' && nonBotUsers.size >= 10) {
                await reaction.message.delete().catch(() => {
                  console.log("Suggestion doesn't exist!")
                });
            }

        // Handle ✅ Reactions: Update pinning after removal
        if (reaction.emoji.name === '✅') {
            // Fetch all messages in the channel
            const messages = await reaction.message.channel.messages.fetch();

            // Create a map of ✅ reaction counts for each message
            const reactionCounts = new Map();
            messages.forEach(msg => {
                const upvoteReaction = msg.reactions.cache.get('✅');
                if (upvoteReaction) {
                    reactionCounts.set(msg.id, upvoteReaction.count || 0);
                }
            });

            // Sort messages by reaction count in descending order
            const sortedMessages = Array.from(reactionCounts.entries())
                .sort(([, aCount], [, bCount]) => bCount - aCount);

            // Pin the message with the highest upvotes
            if (sortedMessages.length > 0) {
                const [topMessageId, topMessageReactions] = sortedMessages[0];
                const topMessage = messages.get(topMessageId);

                if (topMessage && !topMessage.pinned) {
                    await topMessage.pin().catch(() => {
                      console.log("Failed to pin suggestion to top!")
                    });
                }
            }

            // Unpin the message with the least upvotes
            if (sortedMessages.length > 1) {
                const [bottomMessageId, bottomMessageReactions] = sortedMessages[sortedMessages.length - 1];
                const bottomMessage = messages.get(bottomMessageId);

                if (bottomMessage && bottomMessage.pinned && bottomMessageReactions < sortedMessages[0][1]) {
                    await bottomMessage.unpin().catch(() => {
                      console.log("Failed to unpin suggestion!")
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error handling reaction removal:', error);
    }
// End of Message Reaction Remove
}