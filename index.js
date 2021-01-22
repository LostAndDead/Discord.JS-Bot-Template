//Get all the stuff we need
const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');

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

//Define command collection
bot.commands = new Discord.Collection();

// Command loader
fs.readdir("./commands/", (err, file) => {

    if (err) console.log(err);

    let jsfile = file.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Cant Find Commands");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        bot.commands.set(props.help.name, props);
    });
    console.clear()
    console.log("All commands loaded successfully\n");
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
});

//Deal with messages
bot.on("message", async message => {
    //Ignore bots
    if (message.author.bot) return;
    //Split the message
    let messageArray = message.content.split(" ");
    //Set the arguments from the command
    let args = messageArray.slice();
    //Get the command all in lower case for compatability 
    let cmd = messageArray[0].toLowerCase();
    //Seperate the command from the args
    args = messageArray.slice(1);
    //If the first character is the prefix its a command
    if (Config.Setup.Prefix == cmd.slice(0, 1)) {
        //We get the file it might corospond to
        let Commandfile = bot.commands.get(cmd.slice(Config.Setup.Prefix.length));
        //If there is a file for that we run it
        if (Commandfile) Commandfile.run(bot, message, args);
    }
});

//LOGIN!
bot.login(Config.Setup.Token);