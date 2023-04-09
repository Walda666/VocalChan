const discord = require('discord.js');
const db = require("../db");
const config = require('../config.json');
const syncSql = require("sync-sql");
module.exports = {
    async run(message, args, client) {
        let configA = {

            host: "localhost",
            user: "root",
            password: config.mdp,
            database : "vocalchan"
          }

        if(args.length < 1) return message.channel.send(`${config.prefix}channel [add/remove/list]`)
        let type = args[0]
        if(type != "add" && type != "remove" && type != "list") return message.channel.send(`${config.prefix}channel [add/remove/list]`)
        if(type == "add") {
            if(args.length != 2) return message.channel.send(`Please specify a voice channel id`)
            let voc = args[1]
            if(voc.length != 18) return message.channel.send("This id is not valid")
        
            let query = `SELECT * FROM guild WHERE discordid = '${message.channel.guild.id}'`
            let result = syncSql.mysql(configA, query).data.rows
            if(result.length == 0) {
                db.query(`INSERT INTO guild(discordid) VALUES('${message.channel.guild.id}')`, function (err2, result2) {
                    if(err2) throw err2
                });
            }

        // reselect pour récupérer id

            query = `SELECT id FROM guild WHERE discordid = '${message.channel.guild.id}'`
            result = syncSql.mysql(configA, query).data.rows
            let guildId = result[0].id

            query = `SELECT * FROM whitelist WHERE discordid = '${voc}'`
            result = syncSql.mysql(configA, query).data.rows
            if(result.length == 0) {
                db.query(`INSERT INTO whitelist(discordid, guild) VALUES('${voc}', '${guildId}')`, function (err2, result2) {
                    if(err2) throw err2
                });
                message.react("✅")

            } else {
                return message.channel.send(`This channel is already log. ${config.prefix}channel remove [id] to unlog it`)
            }
        }

        if(type == "remove") {
            if(args.length != 2) return message.channel.send(`Please specify a voice channel id`)
            let voc = args[1]
            if(voc.length != 18) return message.channel.send("This id is not valid")
            
            let query2 = `SELECT * FROM whitelist WHERE discordid = '${voc}'`
            result = syncSql.mysql(configA, query2).data.rows
            if(result.length == 0) {
                return message.channel.send(`This channel is not log. ${config.prefix}channel add [id] to log it`)
            } else {
                db.query(`DELETE FROM whitelist WHERE discordid = '${voc}'`, function (err2, result2) {
                    if(err2) throw err2
                });
                message.react("✅")
            }
        }

        if(type == "list") {
            querax = `SELECT W.discordid FROM whitelist W JOIN guild G ON W.guild = G.id WHERE G.discordid = '${message.channel.guild.id}'`
            result = syncSql.mysql(configA, querax).data.rows
            if(result.length == 0) {
                return message.channel.send("There is no voice channel log here.")
        } else {
            let desc = `Channels log :\n\n`
            for(i = 0; i < result.length; i++) {
                let chan = await message.guild.channels.fetch(result[0].discordid)
                desc += `**·** ${chan.name} ~ ${chan.id}`
            }
            let embed = new discord.MessageEmbed()
            .setTitle("Channels list")
            .setDescription(desc)
            message.channel.send({embeds:[embed]})
        }
    }

},
name: 'channel'
}