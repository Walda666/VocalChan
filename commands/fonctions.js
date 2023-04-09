const discord = require("discord.js")
const configA = require("../config.json")
const syncSql = require("sync-sql");
const db = require("../db")
module.exports = {
    config: {

        host: "localhost",
        user: "root",
        password: configA.mdp,
        database : "vocalchan"
      },

    

    pagin: function(message, pages, userr) {
        message.react("🇬🇧")
        message.react("🇫🇷")
        const filter = (reaction, user) => true
        const collector = message.createReactionCollector(filter, {max: 1});
        collector.on('collect', (reaction, user) => {
            if(reaction.emoji.name === "🇬🇧" && !user.bot && user.id == userr.id) {
                message.reactions.resolve("🇬🇧").users.remove(user)
                message.edit(pages[0])
            }
            if(reaction.emoji.name === "🇫🇷" && !user.bot && user.id == userr.id) {
                message.reactions.resolve("🇫🇷").users.remove(user)
                message.edit(pages[1])
            }
        });
    },

    joinVoc: function(newMember) {
        let guilde = newMember.guild
        let chan = guilde.channels.cache.get(newMember.channelId)
        let category = chan.parentId
        let member = guilde.members.cache.get(newMember.id)
        let nbChan = member.voice.channel.members.size
        // Si tout seul : créer chan + donner accès + add db
        if(nbChan == 1) {
            guilde.channels.create(`ecrit-${chan.name}`, {
                type: "voice",
                permissionOverwrites: [
                    {
                        id: guilde.roles.everyone, //To make it be seen by a certain role, user an ID instead
                        deny: ['VIEW_CHANNEL'], //Deny permissions
                        allow: []
                },
                {
                    id: member.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                }
            ],
            }).then((chanEcrit) => {
                if(category != null) {
                    chanEcrit.setParent(category)
                    chanEcrit.permissionOverwrites.edit(guilde.roles.everyone, { VIEW_CHANNEL: false });
                    chanEcrit.permissionOverwrites.edit(member.id, { VIEW_CHANNEL: true });
                }
                db.query(`INSERT INTO channels(vocal, ecrit) VALUES('${chan.id}', '${chanEcrit.id}')`, function (err2, result2) {
                    if(err2) throw err2
                });
            });

        } else {

        // Sinon : donner accès au channel
        var query = `SELECT * FROM channels WHERE vocal = '${chan.id}'`
        var output = syncSql.mysql(this.config, query)
        var result = output.data.rows
        if(result.length == 0) return

        let thanos = guilde.channels.fetch(result[0].ecrit)
        thanos.then((chanEcrit) => {
            chanEcrit.permissionOverwrites.edit(member.user, { VIEW_CHANNEL: true });
            });
        }
    },

    leaveVoc: function(oldMember) {
        let guilde = oldMember.guild
        let chan = guilde.channels.cache.get(oldMember.channelId)
        let member = guilde.members.cache.get(oldMember.id)
        let nbChan = chan.members.size

        // Si pas dernier : enlève la perm
        if(nbChan > 0) {
            var query = `SELECT * FROM channels WHERE vocal = '${chan.id}'`
            var output = syncSql.mysql(this.config, query)
            var result = output.data.rows
            if(result.length == 0) return console.log("pb")

            let thanus = guilde.channels.fetch(result[0].ecrit)
            thanus.then((chanEcrit) => {
                chanEcrit.permissionOverwrites.edit(member.user, { VIEW_CHANNEL: false });
            });
            
            } else {
                // Si dernier : supprime le chann et de la db 
                var query = `SELECT * FROM channels WHERE vocal = '${chan.id}'`
                var output = syncSql.mysql(this.config, query)
                var result = output.data.rows
                if(result.length == 0) return console.log("pb")
                let thanons = guilde.channels.fetch(result[0].ecrit)
                thanons.then((chanEcrit) => {
                    chanEcrit.delete()

                    db.query(`DELETE FROM channels WHERE vocal = '${chan.id}'`, function (err2, result2) {
                        if(err2) throw err2
                    });
                });
            }
    },
    
    
    name: "fonction"

}