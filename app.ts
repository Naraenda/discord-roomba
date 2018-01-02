import * as AdjAnim from 'adjective-adjective-animal'
import { Client, GuildMember, GuildChannel, VoiceChannel } from 'discord.js'

class Settings {
    public token
    public creationRegEx
    public temporaryRegEx
    constructor(path:string){
        let file = require(path);
        
        this.token          = file.token,
        this.creationRegEx  = new RegExp(file.creationChannel),
        this.temporaryRegEx = new RegExp(file.temporaryCategory)
    }
}

function onVoiceJoin(member:GuildMember):void {
    let channel:VoiceChannel = member.voiceChannel

    if (channel && getRoombaChannelType(channel) == RoombaChannelType.Creation) {
        let category = member.guild.channels.find((v, k) => {
            return getRoombaChannelType(v) == RoombaChannelType.Category
        })

        AdjAnim({ adjectives: 1, format: 'title' }).then(n => {
            (member.guild as any).createChannel(n, { type: 'voice', parent: category }). // Provided typings not up to date.
            then(c_ => {
                let c = c_ as VoiceChannel
                c.overwritePermissions(member, { MANAGE_ROLES: true, MANAGE_CHANNELS: true })
                c.setBitrate(channel.bitrate)
                member.setVoiceChannel(c)
            })
        })
    }
}

function onVoiceLeave(member:GuildMember):void {
    let channel:VoiceChannel = member.voiceChannel

    if (channel && getRoombaChannelType(channel) == RoombaChannelType.Temporary && (channel.members.size <= 0)) {
        channel.delete()
    }
}

function getRoombaChannelType(channel:GuildChannel):RoombaChannelType {
    const CreationRegEx :RegExp = settings.creationRegEx
    const TemporaryRegEx:RegExp = settings.temporaryRegEx

    if (channel.name.match(CreationRegEx)) {
        return RoombaChannelType.Creation
    }

    if (channel.name.match(TemporaryRegEx) != null && channel.type == 'category') {
        return RoombaChannelType.Category
    }

    if (channel.parent && channel.parent.name.match(TemporaryRegEx) !== null) {
        return RoombaChannelType.Temporary
    }
    return RoombaChannelType.Other
}

enum RoombaChannelType {
    Creation, Temporary, Category, Other
}

//--------------//
// Start Roomba //
//--------------//

const settings:Settings = new Settings('./settings.json');
const client = new Client();

client.on('voiceStateUpdate', (oldMember:GuildMember, newMember:GuildMember) => {
    if (oldMember)
        onVoiceLeave(oldMember)
    if (newMember)
        onVoiceJoin(newMember)
})
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.login(settings.token)