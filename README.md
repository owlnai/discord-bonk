# discord-bonk
Pretty simple bot that detects Nitro phising links in Discord and autodeletes them by default. 

Has the option to either report them to a mod channel, kick the author or even keep the original message. Configurable per-guild using slash commands.

It can be self-hosted if you want.

## Installation & run
- Clone the repository
- Install the packages with your favorite Node.js package manager. There's a lockfile included if you use PNPM.
- Edit `config.sample.json` with the appropiate values and rename it to `config.json`
- Run `npm start` (or the equivalent)
- ???
- Bonk

## FAQ
### How do I update the code?
This repository should work as a "base" for your bot. If you don't touch the code files, you can pull the latest changes with Git. Otherwise, you might need to implement them manually.

### The commands don't deploy.
There can be two reasons: missing Oauth scope and global command cache. 
- **Missing OAuth2 scope**. When inviting the bot to a Discord server, make sure it has the `applications.commands` scope.  
- **Global command cache**. This only might happen if you edit the commands at [deploy-commands.js](deploy-commands.js). When you first submit the commands to Discord's API, it puts them under a cache that refreshes every hour, so it might take some time if you add more commands. If your bot works only in one server, you could change the `Routes.applicationCommands(clientID)` method to `Routes.applicationGuildCommands(clientID, guildID)` as there's no cache for local guild commands.

### Where do I host it?
You can use any VPS as long as it lets you use Node.js.

### I still haven't solved my issue
Open a new issue on GitHub and I'll take a look into it.

## Acknowledgements
- Discord.js for their easy-to-use library. The entire bot was built in less than half a day.
- `stop-discord-phishing` for their comprehensive list of phising links.
- `makibonk` for the original idea behind the bot.