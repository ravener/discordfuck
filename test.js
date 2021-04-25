// Usage node test.js <file.bf> [args...]
// Inteprets a brainfuck script for testing.
const { run } = require("./vm.js");
const { lex } = require("./lexer.js");
const { readFileSync } = require("fs");

const file = process.argv[2];
const args = process.argv.slice(3);

if (!file) {
  console.error("Usage: node test.js <file.bf> [args...]");
  process.exit(1);
}

const instructions = lex(readFileSync(file, "utf8"));

// Mock the message object to redirect output to console.
run({ instructions }, { channel: { send: console.log } }, args)
  .catch(err => console.error(err.toString()));
