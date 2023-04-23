import ASTNode from "./ASTNode.js";
import { Err, Ok } from "../result.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { alt, many0, map, recognize, tuple, withError } from "../util_parsers/combinator.js";
import { alpha, alphaNumeric, oneOf, tag } from "../util_parsers/basic.js";
import { parseASTNode } from "./composite_parsers.js";
import { whitespaceOffset } from "./Context.js";
export default class ObjectEntryNode extends ASTNode {
    key;
    value;
    constructor(key, value, context) {
        super(context);
        this.key = key;
        this.value = value;
    }
    static parse(input, context) {
        const parseResult = parseObjectEntry(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(`входження об'єкту (${parseResult.unwrapErr()})`, input, new CustomError("Розбір входження об'єкту")));
        }
        const [rest, [key, [value, newContext]]] = parseResult.unwrap();
        return new Ok([
            rest,
            [
                new ObjectEntryNode(key, value, context),
                newContext,
            ],
        ]);
    }
    toString() {
        return `ObjectEntryNode({ key: "${this.key}", value: ${this.value} })`;
    }
}
export function parseIdent(input) {
    return recognize(tuple(alt(tag("_"), alpha), // first char must be alpha or underscore
    alphaNumericOrUnderscore0, // rest of chars must be alphanumeric or underscore
    many0(tuple(oneOf("'ʼ"), alpha, alphaNumericOrUnderscore0))))(input);
}
function alphaNumericOrUnderscore0(input) {
    return many0(alt(alphaNumeric, tag("_")))(input);
}
function parseObjectEntry(input, context) {
    const keyAndEq = tuple(i => withError(parseIdent, new ParseError("ключ входження об'єкту", i, new CustomError("Розбір ключа входження об'єкту")))(i), whitespaceOffset, i => withError(tag("="), new ParseError("=", i, new CustomError("Розбір '=' між ключем і значенням")))(i), whitespaceOffset)(input);
    if (keyAndEq.isErr()) {
        return new Err(keyAndEq.unwrapErr());
    }
    const [rest, [key, ws1, , ws2]] = keyAndEq.unwrap();
    const newContext = context
        .addColumns(key.length)
        .addRows(ws1.rows)
        .addColumns(ws1.columns + 1)
        .addRows(ws2.rows)
        .addColumns(ws2.columns);
    return map(i => parseASTNode(i, newContext), (value) => [key, value])(rest);
}
//# sourceMappingURL=ObjectEntryNode.js.map
