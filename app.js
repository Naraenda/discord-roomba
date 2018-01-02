"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AdjAnim = require("adjective-adjective-animal");
const discord_js_1 = require("discord.js");
class Settings {
    constructor(path) {
        let file = require(path);
        this.token = file.token,
            this.creationRegEx = new RegExp(file.creationChannel),
            this.temporaryRegEx = new RegExp(file.temporaryCategory);
    }
}
function onVoiceJoin(member) {
    let channel = member.voiceChannel;
    if (channel && getRoombaChannelType(channel) == RoombaChannelType.Creation) {
        let category = member.guild.channels.find((v, k) => {
            return getRoombaChannelType(v) == RoombaChannelType.Category;
        });
        AdjAnim({ adjectives: 1, format: 'title' }).then(n => {
            member.guild.createChannel(n, { type: 'voice', parent: category }).
                then(c_ => {
                let c = c_;
                c.overwritePermissions(member, { MANAGE_ROLES: true, MANAGE_CHANNELS: true });
                c.setBitrate(channel.bitrate);
                member.setVoiceChannel(c);
            });
        });
    }
}
function onVoiceLeave(member) {
    let channel = member.voiceChannel;
    if (channel && getRoombaChannelType(channel) == RoombaChannelType.Temporary && (channel.members.size <= 0)) {
        channel.delete();
    }
}
function getRoombaChannelType(channel) {
    const CreationRegEx = settings.creationRegEx;
    const TemporaryRegEx = settings.temporaryRegEx;
    if (channel.name.match(CreationRegEx)) {
        return RoombaChannelType.Creation;
    }
    if (channel.name.match(TemporaryRegEx) != null && channel.type == 'category') {
        return RoombaChannelType.Category;
    }
    if (channel.parent && channel.parent.name.match(TemporaryRegEx) !== null) {
        return RoombaChannelType.Temporary;
    }
    return RoombaChannelType.Other;
}
var RoombaChannelType;
(function (RoombaChannelType) {
    RoombaChannelType[RoombaChannelType["Creation"] = 0] = "Creation";
    RoombaChannelType[RoombaChannelType["Temporary"] = 1] = "Temporary";
    RoombaChannelType[RoombaChannelType["Category"] = 2] = "Category";
    RoombaChannelType[RoombaChannelType["Other"] = 3] = "Other";
})(RoombaChannelType || (RoombaChannelType = {}));
const settings = new Settings('./settings.json');
const client = new discord_js_1.Client();
client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (oldMember)
        onVoiceLeave(oldMember);
    if (newMember)
        onVoiceJoin(newMember);
});
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.login(settings.token);
