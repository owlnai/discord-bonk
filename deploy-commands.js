const { clientId, guildId, token } = require('./config.json');

const { REST } = require('@discordjs/rest');
const { Routes, ChannelType } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('server')
        .addBooleanOption(option => option.setName('autokick')
            .setDescription('Should it autokick the user upon infraction?')
        )
        .addBooleanOption(option => option.setName('autodelete')
            .setDescription('Should it delete?')
        )
        .addChannelOption(option => option.setName('modchannel')
            .setDescription('Mod channel?')
            .addChannelType(ChannelType.GuildText)
        )
        .addStringOption((option) =>
            option
                .setName('language')
                .setDescription('Language?')
                .addChoices([
                    ['English', 'en'],
                    ['Español', 'es'],
                ]),
        )
        .addRoleOption((option) =>
            option
                .setName("roleid")
                .setDescription("Role id?")
        )
        .addBooleanOption(option => option.setName('autorole')
            .setDescription('Should it give the user a custom role upon infraction?')
    )
        .addBooleanOption(option => option.setName('removeroles')
            .setDescription('Should it remove the other roles (except the custom role, if set) upon infraction?')
        )
        .setDescription('Sets bot info for the guild (server)'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();