const Discord = require("discord.js");
const db = require("./db");
const config = require('./config.json');
const fx = require("./commands/fonctions")
const syncSql = require("sync-sql")
const configA = {

    host: "localhost",
    user: "root",
    password: config.mdp,
    database : "vocalchan"
  }

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_VOICE_STATES] });
fs = require('fs')

client.login(config.token);
client.commands = new Discord.Collection()

fs.readdir('./commands', (err, files) => {
    if(err) throw err
    files.forEach(file => {
        if(!file.endsWith('.js')) return
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })
})

client.on('message', message => {
    if(message.type !== 'DEFAULT' || message.author.bot) return
    const args = message.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if(!commandName.startsWith(config.prefix)) return
    const command = client.commands.get(commandName.slice(config.prefix.length))
    if(!command) return
    command.run(message, args, client)
});




client.once('ready',  () => {
    client.on('voiceStateUpdate', (oldMember, newMember) => {
        // Vérifier que le chanel est wl :
        let query = `SELECT * FROM guild WHERE discordid = '${newMember.guild.id}'`
        let result = syncSql.mysql(configA, query).data.rows
        if(result.length == 0) return

        // swap
        if(newMember.channelId != null && oldMember.channelId != null) {
            query = `SELECT * FROM whitelist WHERE discordid = '${newMember.channelId}'`
            let result = syncSql.mysql(configA, query).data.rows
            if(result.length != 0) fx.joinVoc(newMember)
            let query2 = `SELECT * FROM whitelist WHERE discordid = '${oldMember.channelId}'`
            let result2 = syncSql.mysql(configA, query2).data.rows
            if(result2.length != 0) fx.leaveVoc(oldMember)
            
            
        } else {
            // join
            if(oldMember.channelId == null) {
                query = `SELECT * FROM whitelist WHERE discordid = '${newMember.channelId}'`
                let result = syncSql.mysql(configA, query).data.rows
                if(result.length == 0) return
                fx.joinVoc(newMember)
            }
            // leave
            if(newMember.channelId == null) {
                fx.leaveVoc(oldMember)
            }
        }
        
    })
    console.log("Good !");
    client.user.setStatus('invisible')
});