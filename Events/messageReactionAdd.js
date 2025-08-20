const {Client} = require('discord.js');
const {QuickDB} = require('quick.db')
const db = new QuickDB();

/**
 * 
 * @param {Client} bot
 */

module.exports.execute = async(bot, reaction, user) => {
    // Message Reaction Add
      // Ignore bot reactions
      if (user.bot) return;
  
      // Fetch the suggestion channel ID from the database
      const suggestionChannelId = await db.get(`LogsSetup_${reaction.message.guild.id}.suggestionchannel`);
      if (!suggestionChannelId) return;
  
      // Ensure the reaction belongs to the suggestion channel
      if (reaction.message.channel.id !== suggestionChannelId) return;
  
      try {
          // Fetch all users for the reaction
          await reaction.users.fetch();
  
          // Filter out bot reactions
          const nonBotUsers = reaction.users.cache.filter(u => !u.bot);
  
          // Handle ❌ Reactions: Delete the message if it has 10+ downvotes
          if (reaction.emoji.name === '❌' && nonBotUsers.size >= 10) {
              await reaction.message.delete().catch(() => {
                console.log("Suggestion does not exist!")
              });
          }
  
          // Handle ✅ Reactions: Pin the top-upvoted message
          if (reaction.emoji.name === '✅') {
              // Fetch all messages in the channel
              const messages = await reaction.message.channel.messages.fetch();
  
              // Create a map of ✅ reaction counts for each message
              const reactionCounts = new Map();
              messages.forEach(message => {
                  const upvoteReaction = message.reactions.cache.get('✅');
                  if (upvoteReaction) {
                      reactionCounts.set(message.id, upvoteReaction.count || 0);
                  }
              });
  
              // Sort messages by reaction count in descending order
              const sortedMessages = Array.from(reactionCounts.entries())
                  .sort(([, aCount], [, bCount]) => bCount - aCount);
  
              // Pin the message with the highest upvotes
              if (sortedMessages.length > 0) {
                  const [topMessageId, topMessageReactions] = sortedMessages[0];
                  const topMessage = messages.get(topMessageId);
  
                  if (topMessage) {
                      const secondReactions = sortedMessages.length > 1 ? sortedMessages[1][1] : -1;
  
                      if (topMessageReactions > secondReactions && !topMessage.pinned) {
                          await topMessage.pin().catch(() => {
                            console.log('Failed to pin suggestion to top!')
                          });
                      }
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
          console.error('Error handling reaction:', error);
      }
  // End of Message Reaction Add
}