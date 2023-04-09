const discord = require('discord.js');
const config = require('../config.json');
const fx = require("./fonctions")
module.exports = {
    async run(message, args, client) {
        let descen = `**·** ${config.prefix}channel add [id] : add a voice channel to the list\n\n**·** ${config.prefix}channel remove [id] : Remove a channel from list\n\n**·** ${config.prefix}channel list : Display the list of selected channels\n\n\nFor each voice channel of this list, a temporary text channel will be create only for the members of the vocal. The text channel will be delete after all members leave the vocal`

        let descfr = `**·** ${config.prefix}channel add [id] : Ajouter un salon vocal a la liste\n\n**·** ${config.prefix}channel remove [id] : Supprimer un salon de la liste\n\n**·** ${config.prefix}channel list : Affiche la liste des salon séléctionnés\n\n\n\nPour chaque salon vocal de cette liste, un salon textuel temporaire sera crée quand des personnes le rejoignent, exclusif à ceux-ci.\nIl sera ensuite supprimé quand la dernière personne quittera le salon vocal`

        let embed = new discord.MessageEmbed()
        .setTitle("Help")
        .setDescription(descen)
        let embed2 = new discord.MessageEmbed()
        .setTitle("Aide")
        .setDescription(descfr)

        pages = []
        pages.push({embeds : [embed]})
        pages.push({embeds : [embed2]})
        let messagepag = await message.channel.send(pages[0])
        fx.pagin(messagepag, pages, message.author)
},
name: 'help'
}