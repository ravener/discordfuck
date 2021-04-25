/**
 * JavaScript brainfuck interpreter by Raven.
 *
 * We implement the following spec:
 *
 * • 30,000 memory cells but extends dynamically. (unbounded)
 * • EOF sets the cell to 0
 * • Cells are JavaScript integers.
 * • The whole output is buffered until the program terminates.
 *
 * @author Raven https://github.com/ravener
 * @license MIT
 */

function computeJumpTable(instructions) {
  let pc = 0;
  const table = new Array(instructions.length).fill(0);

  while (pc < instructions.length) {
    const instruction = instructions[pc];

    if (instruction === "[") {
      let nest = 1;
      let seek = pc;

      while (nest && ++seek < instructions.length) {
        if (instructions[seek] === "]") {
          nest--;
        } else if (instructions[seek] === "[") {
          nest++;
        }
      }

      if (!nest) {
        table[pc] = seek;
        table[seek] = pc;
      } else {
        throw new Error(`Unmatched '[' at PC=${pc}`);
      }
    }

    pc++;
  }

  return table;
}


class VM {
  constructor(instructions, msg, timeout, args) {
    this.instructions = instructions;
    this.timeout = timeout;
    this.message = msg;

    this.args = args || "";
    this.argp = 0; // Argument pointer.

    this.cells = new Array(30000).fill(0);
    this.cp = 0; // Cell pointer.

    // Jump table for loops.
    this.jump = computeJumpTable(instructions);
  }

  input() {
    const input = this.args[this.argp++];

    if (input) {
      this.cells[this.cp] = input.charCodeAt(0);
    } else {
      // Set 0 for EOF.
      this.cells[this.cp] = 0;
    }
  }

  incr() {
    this.cells[this.cp]++;
    return this;
  }

  dec() {
    this.cells[this.cp]--;
    return this;
  }

  next() {
    if (this.cp >= this.cells.length) {
      // Extend the cells with 4 extra slots.
      this.cells.push(0, 0, 0, 0);
    }

    this.cp++;
    return this;
  }

  prev() {
    if (this.cp <= 0) {
      throw new RangeError("Negative cell index.");
    }

    this.cp--;
    return this;
  }

  /**
   * Main interpreter loop.
   */
  async run() {
    // Program counter/Instruction pointer.
    let pc = 0;

    // Buffer all output.
    const buffer = [];

    const start = Date.now();

    while (pc < this.instructions.length) {
      // Check for timeout first.
      if ((Date.now() - start) > this.timeout) {
        throw new Error("Execution timed out.");
      }

      const instruction = this.instructions[pc];

      switch (instruction) {
      case "+":
        this.incr();
        break;
      case "-":
        this.dec();
        break;
      case ">":
        this.next();
        break;
      case "<":
        this.prev();
        break;
      case ".":
        buffer.push(this.cells[this.cp]);
        break;
      case "[":
        if (this.cells[this.cp] === 0) pc = this.jump[pc];
        break;
      case "]":
        if (this.cells[this.cp] !== 0) pc = this.jump[pc];
        break;
      case ",":
        this.input();
        break; 
      }

      // Increment pc.
      pc++;
    }

    // And finally when program is done send the output buffer.
    const response = Buffer.from(buffer).toString().trim();
    if (response) return this.message.channel.send(response);
  }
}

// A simple shortcut to run a command.
function run(command, msg, args = [], timeout = 60 * 1000) {
  return new VM(command.instructions, msg, timeout, args.join(" "))
    .run();
}

module.exports = { VM, run };
