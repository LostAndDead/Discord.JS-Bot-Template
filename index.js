//Get all the stuff we need
const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');
const slashSetup = require("./utils/slashSetup")
const utils = require("./utils/slashUtils")

//Create the bot varible but make it not able to mention everyone to prevent abuse
const bot = new Discord.Client({ disableEveryone: true });

//Get out config loaded
let Config = null;
try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}

var calls = []

//Create calls for slash commands
fs.readdir("./commands/", (err, file) => {

    if (err) console.log(err);

    let jsfile = file.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Cant Find Commands");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        let data = props.info
        calls.push(data)
    });
});

// Discord.JS Client listeners
bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
//bot.on("debug", (e) => console.info(e));
bot.on('reconnecting', () => console.log('Reconnecting WS...'));
bot.on('disconnect', () => {
    console.log('Disconnected, trying to restart...');
    process.exit();
});

// NodeJS process listeners
process.on('unhandledRejection', console.error);
process.on('warning', console.warn);

//On ready statment
bot.on("ready", async() => {
    console.log("\nThe bot is now online")
    console.log("Keep this window open for the bot to run\n")
    console.log(`Invite me to a server with the following link.\nhttps://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=125952&scope=bot\n`);
    console.log("Press CTRL+C to exit\n")
    bot.user.setPresence({
        status: "online",
        activity: {
            name: Config.Settings.StatusMessage,
            type: Config.Settings.StatusType
        }
    });
    if(Config.Commands.SetupCommands){
        slashSetup.sendCalls(bot, calls)
    }
});

bot.ws.on("INTERACTION_CREATE", async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    //Load all the commands
    const ping = require("./commands/ping")

    switch(command){
        case "ping":
            ping.run(bot, interaction, args)
            break;
    }
})

//LOGIN!
bot.login(Config.Setup.Token);