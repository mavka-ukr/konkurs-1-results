import ASTNode from "./ASTNode.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { Err, Ok } from "../result.js";
import { noneOf, oneOf, tag } from "../util_parsers/basic.js";
import { alt, delimited, many0, map, preceded, value, withError } from "../util_parsers/combinator.js";
export default class TextNode extends ASTNode {
    text;
    constructor(text, context) {
        super(context);
        this.text = text;
    }
    static parse(input, context) {
        const parseResult = stringLiteral(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError(`текст (${parseResult.unwrapErr().toString()})`, input, new CustomError("Розбір текстового вузла")));
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new TextNode(n, context), context.addColumns(input.length - rest.length)]]);
    }
    toString() {
        return `TextNode("${this.text}")`;
    }
}
const escapedLineFeed = preceded(tag("\\"), tag("n"));
const escapedCarriageReturn = preceded(tag("\\"), tag("r"));
const allowedChars = noneOf("\"\\n\\r\\\\");
const escapedChar = preceded(tag("\\"), oneOf("\"t\\\\"));
const stringWithoutQuotes = many0(alt(value(escapedLineFeed, "\n"), value(escapedCarriageReturn, "\r"), map(escapedChar, char => ({
    "\"": "\"",
    "t": "\t",
    "\\": "\\",
})[char]), allowedChars));
const stringLiteral = map(delimited(i => withError(tag("\""), new ParseError('"', i, new CustomError("Розбір початку текстового вузла")))(i), stringWithoutQuotes, i => withError(tag("\""), new ParseError('"', i, new CustomError("Розбір кінця текстового вузла")))(i)), (chars) => chars.join(""));
//# sourceMappingURL=TextNode.js.map
