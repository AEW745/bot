const {
    Client,
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    User,
    Guild,
    Events,
    PermissionsBitField,
} = require('discord.js')

const noblox = require('noblox.js')
require('dotenv').config();
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'XP',
    description: 'Give or Remove XP and Levels',
    data: new SlashCommandBuilder()
    .setName('xp')
    .setDescription('Change XP and Levels')
    .addSubcommand((subcommand)=>
      subcommand
    .setName("give")
    .setDescription("Gives XP or Levels")
    .addUserOption((option) => 
      option.setName('user')
      .setDescription('Choose a user to give XP to.')
      .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('type')
      .setDescription('Choose XP or Level to give user.')
      .addChoices(
        {
          name: "XP",
          value: 'xp'
        },
        {
          name: "Level",
          value: 'level'
        }
    )
    .setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('amount')
      .setDescription('Enter an amount to give the user.')
      .setMinValue(1)
      .setMaxValue(500)
      .setRequired(true)
    )
  )
  .addSubcommand((subcommand)=>
    subcommand
  .setName("remove")
  .setDescription("Removes XP or Levels")
  .addUserOption((option) => 
    option.setName('user')
    .setDescription('Choose a user to remove XP from.')
    .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('type')
    .setDescription('Choose XP or Level to remove from user.')
    .addChoices(
      {
        name: "XP",
        value: 'xp'
      },
      {
        name: "Level",
        value: 'level'
      }
  )
  .setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('amount')
    .setDescription('Enter an amount to remove from the user.')
    .setMinValue(1)
    .setMaxValue(500)
    .setRequired(true)
  )
)
.addSubcommand((subcommand)=>
  subcommand
.setName("clear")
.setDescription("Resets XP or Levels")
.addUserOption((option) => 
  option.setName('user')
  .setDescription('Choose a user to reset XP.')
  .setRequired(true)
)
.addStringOption((option) =>
  option.setName('type')
  .setDescription('Choose XP or Level to reset for a user.')
  .addChoices(
    {
      name: "XP",
      value: 'xp'
    },
    {
      name: "Level",
      value: 'level'
    },
    {
      name: "Both",
      value: 'both'
    }
)
.setRequired(true)
)
),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            //let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: false});
            /*if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )*/
            try {
              if (!interaction.member.permissions.any([PermissionsBitField.Flags.Administrator])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000)
            )
              if (!interaction.guild.members.me.permissions.any([PermissionsBitField.Flags.Administrator])) return interaction.editReply(`:x: **ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000)
            )
             if (interaction.options.getSubcommand() === "give") {
              const user = interaction.options.getUser('user');
              const type = interaction.options.getString('type');
              const amount = interaction.options.getInteger('amount');
              if (type === 'xp') {
                await db.add(`Levels_${interaction.guild.id}_${user.id}.xp`, amount)

                interaction.editReply(`:white_check_mark: **SUCCESS** | ${user} has received **${amount} XP!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
              } else {
                const currentAmount = await db.get(`Levels_${interaction.guild.id}_${user.id}.level`)
                if (amount > 15 || amount + currentAmount > 15) return interaction.editReply(`**ERROR** | You can't give levels higher than 15 because level 15 is the max level!`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
                await db.add(`Levels_${interaction.guild.id}_${user.id}.level`, amount)

                interaction.editReply(`:white_check_mark: **SUCCESS** | ${user} has received **${amount} Levels!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
              }
             } else if (interaction.options.getSubcommand() === "remove") {
              const user = interaction.options.getUser('user');
              const type = interaction.options.getString('type');
              const amount = interaction.options.getInteger('amount');
              if (type === 'xp') {
                await db.sub(`Levels_${interaction.guild.id}_${user.id}.xp`, amount)

                interaction.editReply(`:white_check_mark: **SUCCESS** | ${user} has lost **${amount} XP!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
              } else {
                await db.sub(`Levels_${interaction.guild.id}_${user.id}.level`, amount)

                interaction.editReply(`:white_check_mark: **SUCCESS** | ${user} has lost **${amount} Levels!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
              }
             } else {
              const user = interaction.options.getUser('user');
              const type = interaction.options.getString('type');
              if (type === 'xp') {
                await db.set(`Levels_${interaction.guild.id}_${user.id}.xp`, 0)

                interaction.editReply(`:white_check_mark: **SUCCESS** | ${user} has been reset to **0 XP!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
              } else if (type === 'level') {
                await db.set(`Levels_${interaction.guild.id}_${user.id}.level`, 0)

                interaction.editReply(`:white_check_mark: **SUCCESS** | ${user} has been reset to **Level 0!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
              } else {
                await db.set(`Levels_${interaction.guild.id}_${user.id}.level`, 0)
                await db.set(`Levels_${interaction.guild.id}_${user.id}.xp`, 0)

                interaction.editReply(`:white_check_mark: **SUCCESS** | ${user} has been reset to **Level 0 and 0 XP!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
              }
             }
            } catch (err) {
                console.log(err)
            }
        }
    }