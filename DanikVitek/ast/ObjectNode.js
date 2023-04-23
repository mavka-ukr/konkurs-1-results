import ASTNode from "./ASTNode.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { Err, Ok } from "../result.js";
import { pair, withError } from "../util_parsers/combinator.js";
import { listOfEntries } from "./composite_parsers.js";
import { whitespaceOffset } from "./Context.js";
import ObjectEntryNode, { parseIdent } from "./ObjectEntryNode.js";
import { tag } from "../util_parsers/basic.js";
export default class ObjectNode extends ASTNode {
    ident;
    entries;
    constructor(ident, entries, context) {
        super(context);
        this.ident = ident;
        this.entries = entries;
    }
    static parse(input, context) {
        const parseResult = parseObject(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(`об'єкт (${parseResult.unwrapErr()})`, input, new CustomError("Розбір об'єкту")));
        }
        const [rest, [ident, entries, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new ObjectNode(ident, entries, context), newContext]]);
    }
    toString() {
        return `ObjectNode("${this.ident}", [${this.entries.map(e => e.toString()).join(", ")}])`;
    }
}
function parseObject(input, context) {
    const identResult = withError(parseIdent, new ParseError("назва об'єкту", input, new CustomError("Розбір назви об'єкту")))(input);
    if (identResult.isErr()) {
        return new Err(identResult.unwrapErr());
    }
    const [rest, ident] = identResult.unwrap();
    const newContext = context.addColumns(ident.length);
    const openParenResult = withError(pair(tag("("), whitespaceOffset), new ParseError("(", rest, new CustomError("Розбір початку тіла об'єкту")))(rest);
    if (openParenResult.isErr()) {
        return new Err(openParenResult.unwrapErr());
    }
    const [rest2, [, offset]] = openParenResult.unwrap();
    const newContext2 = newContext.addColumns(1).addRows(offset.rows).addColumns(offset.columns);
    const listOfEntriesResult = listOfObjectEntryNodeEntries(rest2, newContext2);
    if (listOfEntriesResult.isErr()) {
        return new Err(listOfEntriesResult.unwrapErr());
    }
    const [rest3, [entries, newContext3]] = listOfEntriesResult.unwrap();
    const closeParenResult = withError(pair(whitespaceOffset, tag(")")), new ParseError(")", rest3, new CustomError("Розбір кінця тіла об'єкту")))(rest3);
    if (closeParenResult.isErr()) {
        return new Err(closeParenResult.unwrapErr());
    }
    const [rest4, [offset2]] = closeParenResult.unwrap();
    const newContext4 = newContext3.addRows(offset2.rows).addColumns(offset2.columns + 1);
    return new Ok([rest4, [ident, entries, newContext4]]);
}
function listOfObjectEntryNodeEntries(input, context) {
    return listOfEntries(input, context, ObjectEntryNode.parse);
}
//# sourceMappingURL=ObjectNode.js.map
