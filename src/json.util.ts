import { DiscordAPIError } from "discord.js";
import * as Discord from 'discord.js';
import { createEmbed } from "./util";

export function convertJson(json: JsonObject): string | Discord.MessageEmbed {
    switch (json.type) {
        case 'embed':
            const value = json as JsonEmbed;
            let embed = createEmbed(value.title, getDescription(value.description));
            if (value.thumbnailUrl && value.thumbnailUrl != '') embed = embed.setThumbnail(value.thumbnailUrl);
            if (value.fields && value.fields.length > 0) {
                for (let item of value.fields) {
                    if (item.title && item.description && getDescription(item.description) != null) {
                        embed = embed.addField(item.title, getDescription(item.description));
                    }
                }
            }
            return embed;
        case 'message':
            const text = json as JsonMessage;
            return getDescription(text.value);
        default:
            return null;
    }
}

export interface JsonObject {
    type: string;
}

interface JsonEmbed extends JsonObject {
    title: string;
    description: string | string[];
    thumbnailUrl: string;
    fields: JsonEmbedField[];
}

interface JsonMessage extends JsonObject {
    value: string | string[];
}

interface JsonEmbedField {
    title: string;
    description: string | string[];
}

function getDescription(value: string | string[], separator?: string): string {
    if (value instanceof String) return <string>value;
    else if (Array.isArray(value)) return (<string[]>value).join(separator == null ? '' : separator);
    else return null;
}