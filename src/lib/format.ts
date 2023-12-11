// `Hello {world:uppercase:pad(10)}.`
export class Formatter {
  tokens: Token[];

  constructor(format: string) {
    this.tokens = tokenize(format);
  }

  format(args: { [key: string]: string }): string {
    let out = "";
    for (let token of this.tokens) {
      if (token instanceof LiteralToken) {
        out += token.value;
      } else if (token instanceof FormatToken) {
        let value = args[token.value];
        if (value == undefined)
          throw new Error(`Undefined value: ${token.value}`);
        out += token.processors.reduce(
          (acc, processor) => processor.process(acc),
          value
        );
      }
    }
    return out;
  }
}

interface Token {}

class LiteralToken implements Token {
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

class FormatToken implements Token {
  value: string;
  processors: Processor[];

  constructor(value: string, processors: Processor[]) {
    this.value = value;
    this.processors = processors;
  }
}

enum ProcessorType {
  Uppercase,
  Lowercase,
  Pad,
}

class Processor {
  type: ProcessorType;
  args: string[];

  constructor(type: ProcessorType, args: string[]) {
    this.type = type;
    this.args = args;
  }

  process(value: string): string {
    switch (this.type) {
      case ProcessorType.Uppercase:
        return value.toUpperCase();
      case ProcessorType.Lowercase:
        return value.toLowerCase();
      case ProcessorType.Pad:
        let [length, padding] = this.args[0].split(",");
        return value.padStart(parseInt(length), padding);
    }
  }
}

function tokenize(input: string): Token[] {
  let out = [];
  let chars = input.split("");

  let i = 0;
  while (i < chars.length) {
    let c = chars[i];
    if (c == "{") {
      let start = i;
      i++;
      while (i++ < chars.length && chars[i] != "}");
      let [value, processors] = parseProcessors(
        input.substring(start + 1, i++)
      );
      out.push(new FormatToken(value, processors));
    } else {
      let start = i++;
      while (i++ < chars.length && chars[i] != "{");
      let value = input.substring(start, i);
      out.push(new LiteralToken(value));
    }
  }

  return out;
}

function parseProcessors(input: string): [string, Processor[]] {
  let [value, ...processors] = input.split(":");

  let out = [];
  for (let processor of processors) {
    let [type, ...args] = processor.split(")")[0].split("(");
    let processorType = {
      uppercase: ProcessorType.Uppercase,
      lowercase: ProcessorType.Lowercase,
      pad: ProcessorType.Pad,
    }[type.toLowerCase()];
    if (processorType == undefined)
      throw new Error(`Unknown processor type: ${type}`);
    out.push(new Processor(processorType, args));
  }

  return [value, out];
}
