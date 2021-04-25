// Lex a brainfuck program, ignoring whitespace and comments.

// Allowed characters, anything else is ignored.
const chars = ["+", "-", ">", "<", ".", ",", "[", "]"];

function lex(src) {
  const tokens = [];

  for (const char of src) {
    if (chars.includes(char)) {
      tokens.push(char);
    }
  }

  return tokens;
}

module.exports = { chars, lex };
