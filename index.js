/**
 * @author Raven
 * @license MIT
 */

const { Client, version, Intents } = require("discord.js");
const { token, prefix, owner } = require("./config.json");
const { readFileSync, readdirSync } = require("fs");
const { inspect } = require("util");
const { lex } = require("./lexer.js");
const { run } = require("./vm.js");

const client = new Client({
  disableMentions: "everyone",
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
});

// Where all the commands are stored.
const commands = new Map();

// Loads a command into the collection and lexes the instructions.
function load(command) {
  const file = readFileSync(`./commands/${command}.bf`, "utf8");

  commands.set(command, {
    name: command,
    instructions: lex(file)
  });
}

const files = readdirSync("commands");

for (const file of files) {
  if (file.endsWith(".bf")) load(file.slice(0, -3));
}

client.on("ready", () => {
  const { tag, id } = client.user;

  console.log(`Logged in as ${tag} (${id})`);
  console.log(`Loaded ${commands.size} commands.`);

  client.user.setActivity(`${prefix}help | Executing brainfuck`);
});

client.on("messageCreate", async (msg) => {
  // Ignore bots and webhooks.
  if (msg.author.bot || msg.webhookID) return;

  // Check for prefix.
  if (!msg.content.startsWith(prefix)) return;

  // Split the arguments.
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const name = args.shift().toLowerCase();

  if (name === "help") {
    const help = [
      ...commands.keys(),
      // JavaScript commands aren't loaded anywhere.
      "help", "stats", "brainfuck", "invite"
    ].sort();

    return msg.channel.send(`**Commands**\n\n${help.join(", ")}`);
  }

  if (name === "stats") {
    const { heapUsed, heapTotal } = process.memoryUsage();

    return msg.channel.send([
      "```asciidoc",
      "= STATISTICS =",
      "",
      `• Mem Usage  :: ${(heapUsed / 1024 / 1024).toFixed(2)} MB`,
      `• Total Mem  :: ${(heapTotal / 1024 / 1024).toFixed(2)} MB`,
      `• Guilds     :: ${client.guilds.cache.size}`,
      `• Channels   :: ${client.channels.cache.size}`,
      `• Users      :: ${client.users.cache.size}`,
      `• Node.js    :: ${process.version}`,
      `• discord.js :: ${version}`,
      "```"
    ].join("\n"));
  }

  // Invite command.
  if (name === "invite") {
    return msg.channel.send([
      "You can invite me via the following link:",
      `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=379968&scope=bot`
    ].join("\n"));
  }

  // Reload command.
  if (name === "reload" && msg.author.id === owner) {
    if (!args.length) {
      return msg.reply("You didn't provide a command to reload.");
    }

    try {
      load(args[0]);
      return msg.reply(`Successfully reloaded \`${args[0]}\``);
    } catch(err) {
      return msg.reply(`Failed to reload: \`\`\`js\n${err}\n\`\`\``);
    }
  }

  if (name === "eval" && msg.author.id === owner) {
    if (!args.length) {
      return msg.reply("You didn't provide code to evaluate.");
    }

    let code = args.join(" ");

    // Strip off codeblocks if given.
    if (code.startsWith("```") && code.endsWith("```")) {
      code = code.slice(code.startsWith("```js") ? 5 : 3, -3);
    }

    try {
      const results = inspect(await eval(code), { depth: 1 });

      if (results.length >= 1990) {
        return msg.channel.send("Results too long.");
      }

      return msg.channel.send(["```js", results, "```"].join("\n"));
    } catch(err) {
      return msg.channel.send(["```js", err.toString(), "```"].join("\n"));
    }
  }

  if (name === "bfeval" || name === "brainfuck" || name === "bf") {
    if (!args.length) {
      return msg.reply("You didn't provide code to evaluate.");
    }

    let code = args.join(" ");

    // Remove codeblocks.
    // This doesn't remove the codeblock language if given
    // But it doesn't matter, it will get removed by the bf lexer.
    if (code.startsWith("```") && code.endsWith("```")) {
      code = code.slice(3, -3).trim();
    }

    try {
      const instructions = lex(code);
      const timeout = msg.author.id === owner ? 60000 : 5000;
      await run({ instructions }, msg, [], timeout);
      return;
    } catch(err) {
      return msg.channel.send(["```js", err.toString(), "```"].join("\n"));
    }
  }

  // Find the command.
  const command = commands.get(name);

  // Command not found.
  // Usually this is a bad practice
  // but this isn't really a serious bot.
  if (!command) {
    return msg.channel.send(`Command '${name}' not found.`);
  }

  try {
    // Execute the command.
    console.log(`[Command] ${msg.author.tag} used ${name}`);
    await run(command, msg, args);
  } catch(err) {
    console.error(err);
    return msg.channel.send(["```js", err.toString(), "```"].join("\n"));
  }
});

// And finally, login.
client.login(token);
