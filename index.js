const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const Sequelize = require('sequelize');
const stopPhishing = require('stop-discord-phishing');
const languages = require("./languages.json");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});


const Guild = sequelize.define('guilds', {
    guild_id: {
        type: Sequelize.TEXT,
        unique: true,
    },
    language: {
        type: Sequelize.TEXT,
        defaultValue: 'en',
    },
    autoKick: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    autoDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    modChannel: {
        type: Sequelize.TEXT,
    },
    autoRole: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    autoRemoveOtherRoles: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    roleID: {
        type: Sequelize.STRING
    }
});


async function initGuild(guild) {
    try {
        await Guild.create({
            guild_id: guild.id,
        });

        console.log(`Created guild ${guild.id}`);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return console.log(`Guild ${guild.id} already exists`);
        } else { throw error; }
    }
}
client.once("ready", () => {
    console.log("Syncing models...");
    Guild.sync();
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    try {
        const actionsToTake = await Guild.findOne({ where: { guild_id: message.guild.id } });
        if (!actionsToTake) {
            await initGuild(message.guild);
            console.log("Couldn't find a guild for some reason, recreating it");
            return;
        }
        let isPhising = await stopPhishing.checkMessage(message.content)
        if (isPhising) {
            if (actionsToTake.autoDelete) {
                if (message.guild.me.permissions.has("MANAGE_MESSAGES")) {
                    message.delete();
                } else {
                    message.channel.send(languages[actionsToTake.language].errors.autoDelete);
                }
            }
            if (actionsToTake.autoKick) {
                if (message.guild.me.permissions.has("KICK_MEMBERS")) {
                    message.member.kick();
                } else {
                    message.channel.send(languages[actionsToTake.language].errors.autoKick || "Error");
                }
            }
            if (actionsToTake.modChannel) {
                const channel = message.guild.channels.cache.get(actionsToTake.modChannel);
                if (!channel) {
                    message.channel.send(languages[actionsToTake.language].errors.autoKick || "Error");
                } else {
                    channel.send(`${message.author.tag} (${message.author.id}) ${languages[actionsToTake.language].modMessage}\n\`\`\`${message.content}\`\`\``);
                }
            }
            if (actionsToTake.autoRole) {
                if (!actionsToTake.roleID) {
                    message.channel.send(languages[actionsToTake.language].errors.roleID || "Error");
                }
                const role = message.guild.roles.cache.get(actionsToTake.roleID);
                if (!message.member.manageable || !role.editable) {
                    message.channel.send(languages[actionsToTake.language].errors.autoRole || "Error");
                } else {
                    message.member.roles.add(role);
                }
            }
            if (actionsToTake.autoRemoveOtherRoles) {
                const roleid = actionsToTake.roleID;
                if (message.member.manageable) {
                    const roles = message.member.roles.cache;
                    if (roleid && roles.get(roleid)?.editable) roles.delete(roleid); // filter out the autorole role, we want to keep it
                    message.member.roles.remove(roles);
                } else {
                    message.channel.send(languages[actionsToTake.language].errors.autoRemoveOtherRoles || "Error");
                }
            }
        }
    } catch (error) {
        console.log('[ERROR] %s', error);
    }
});

client.on("guildCreate", initGuild);
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (commandName === 'server') {
        let opt = {};

        opt.autoKick = interaction.options.getBoolean('autokick');
        opt.autoDelete = interaction.options.getBoolean('autodelete');
        opt.autoDelete = interaction.options.getString("language");
        opt.modChannel = interaction.options.getChannel('modchannel')?.id;
        opt.roleID = interaction.options.getRole('roleid')?.id;
        opt.autoRole = interaction.options.getBoolean('autorole');
        opt.autoRemoveOtherRoles = interaction.options.getBoolean('removeroles');
        opt.language = interaction.options.getString("language");

        Object.keys(opt).forEach((k) => opt[k] == null && delete opt[k]);

        const affectedRows = await Guild.update(opt, { where: { guild_id: interaction.guild.id } });

        if (affectedRows) {
            return interaction.reply(`✅`);
        }
        return interaction.reply(`❌`);
    }
});

client.login(token);
