# Brainfuck Discord Bot.
A Discord Bot with commands written in Brainfuck.

## How it works
The core is written in JavaScript since well, it's just not possible to write an entire bot in brainfuck.

It uses [discord.js](https://discord.js.org) and a brainfuck interpreter written in JavaScript, the interpreter is designed in a way that the `.` commands sends a message to discord and the `,` input commands consumes arguments. So the commands are not strictly discord only, they can be run via other interpreters too, we just changed the input and output logic to redirect to discord instead.

- The `.` command will buffer the output until the end of execution.
- The `,` command will consume a character from the user input, all arguments are optional and will leave the cell `0` if no more characters can be consumed from the command arguments (EOF)

All `.bf` files in `commands/` are loaded as commands with the filenames being the command name and the containing scripts are ran through the custom interpreter everytime a command is requested.

For example, an echo-character command can just be `,.` (saved in `commands/echo.bf`) and assuming a prefix of `!`, when the user invokes it via `!echo h`, the `,` will consume the `h` into the current cell and the next `.` will buffer the output, which is sent after the execution terminates. In this example if another `,` is to be used, it will set the cell to `0` because there's no more output to consume.

You may use the `test.js` script to prototype and test your commands in the terminal.

## Running
**Make sure you have [Node v16+](https://nodejs.org/en/)!**

Just `npm install`, fill the `config.json` and run that `index.js` nothing special.

You may also invite the original public instance I run [here](https://discord.com/oauth2/authorize?client_id=411952600586649602&permissions=379968&scope=bot)

## Commands
The following commands are written in JavaScript:
- `help` Shows a list of commands.
- `reload` (owner-only) Reloads a command.
- `eval` (owner-only) Evaluates JavaScript.
- `stats`
- `invite`
- `brainfuck` (alias: `bf`/`bfeval`) Evaluates brainfuck.

Brainfuck Eval can be used by anyone but it has a timeout of 5 seconds so it should be safe, if ran by the owner they'll get a timeout of 60 seconds.

The following commands are written in brainfuck:
- `ping` (Ping command.)
- `say` (Echo command.)
- `about` (Basic about)
- `hello` (Basic hello world)
- `wc` (Word-count utility)
- `rot13` ([rot13 cipher](https://en.m.wikipedia.org/wiki/ROT13))

## The future
I'm open to suggestions for more commands or ways to improve this.

Contributions and Pull Requests are welcome!

Join `#discordfuck` in my [Personal Discord Server](https://discord.gg/mY39Mspjnk) to discuss and stay up to date.

## License
[MIT License](LICENSE)
