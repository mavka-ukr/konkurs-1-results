import ASTNode from "./ASTNode.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { Err, Ok } from "../result.js";
import { pair, withError } from "../util_parsers/combinator.js";
import { tag } from "../util_parsers/basic.js";
import { listOfEntries, parseASTNode } from "./composite_parsers.js";
import { whitespaceOffset } from "./Context.js";
export default class ListNode extends ASTNode {
    entries;
    constructor(entries, context) {
        super(context);
        this.entries = entries;
    }
    static parse(input, context) {
        const parseResult = parseList(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(`список вузлів (${parseResult.unwrapErr()})`, input, new CustomError("Розбір списку вузлів")));
        }
        const [rest, [entries, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new ListNode(entries, context), newContext]]);
    }
    toString() {
        return `ListNode(${this.entries})`;
    }
}
function parseList(input, context) {
    const parseResult = withError(pair(tag("["), whitespaceOffset), new ParseError("[", input, new CustomError("Розбір початку списку")))(input);
    if (parseResult.isErr()) {
        return new Err(parseResult.unwrapErr());
    }
    const [rest, [, offset]] = parseResult.unwrap();
    let newContext = context.addColumns(1).addRows(offset.rows).addColumns(offset.columns);
    const entriesResult = listOfASTNodeEntries(rest, newContext);
    if (entriesResult.isErr()) {
        return new Err(entriesResult.unwrapErr());
    }
    const [rest2, [entries, newContext1]] = entriesResult.unwrap();
    const endResult = withError(pair(whitespaceOffset, tag("]")), new ParseError("]", rest2, new CustomError("Розбір кінця списку")))(rest2);
    if (endResult.isErr()) {
        return new Err(endResult.unwrapErr());
    }
    const [rest3, [offset2]] = endResult.unwrap();
    newContext = newContext1.addRows(offset2.rows).addColumns(offset2.columns + 1);
    return new Ok([rest3, [entries, newContext]]);
}
function listOfASTNodeEntries(input, context) {
    return listOfEntries(input, context, parseASTNode);
}
//# sourceMappingURL=ListNode.js.map
