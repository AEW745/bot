const { Client, GatewayIntentBits, Partials } = require('discord.js');

require('dotenv').config()

const { readdirSync } = require('fs');

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.GuildMember
    ]
})

bot.commands = new Map()

bot.slashcommands = []

const commands = readdirSync('./Commands').filter(file =>
    file.endsWith('.js')
)

for (const command of commands) {
    const file = require(`./Commands/${command}`)
    bot.commands.set(file.name.toLowerCase(), file)
    if (file.data) {
        bot.slashcommands.push(file.data)
    }
}

const events = readdirSync('./Events')

for (const event of events) {
    const file = require(`./Events/${event}`)
    const name = event.split('.')[0]

    bot.on(name, file.execute.bind(null, bot))
}

bot.login(process.env.Token)