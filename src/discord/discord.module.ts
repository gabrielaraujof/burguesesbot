import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GatewayIntentBits } from 'discord.js';
import { DiscordModule as DiscordAPIModule } from '@discord-nestjs/core';

import { DiscordBotToken } from '../helper/constants';
import { GuildProvider } from './providers/guild.provider';

@Module({
    imports: [
        DiscordAPIModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                token: configService.get(DiscordBotToken, ''),
                discordClientOptions: {
                    intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMembers,
                        GatewayIntentBits.GuildPresences,
                    ],
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [GuildProvider],
    exports: [GuildProvider],
})
export class DiscordModule { }
