import { Err, Ok } from "../result.js";
import { tag } from "../util_parsers/basic.js";
import { alt, pair, withError } from "../util_parsers/combinator.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { whitespaceOffset } from "./Context.js";
import DictionaryNode from "./DictionaryNode.js";
import EmptyNode from "./EmptyNode.js";
import ListNode from "./ListNode.js";
import LogicalNode from "./LogicalNode.js";
import NumberNode from "./NumberNode.js";
import ObjectNode from "./ObjectNode.js";
import TextNode from "./TextNode.js";
export function parseASTNode(input, context) {
    return withError(alt((i => EmptyNode.parse(i, context)), (i => LogicalNode.parse(i, context)), (i => NumberNode.parse(i, context)), (i => TextNode.parse(i, context)), (i => ObjectNode.parse(i, context)), (i => DictionaryNode.parse(i, context)), (i => ListNode.parse(i, context))), new ParseError('щось з переліку: "пусто", "так", "ні", число, текст, об\'єкт, словник або список', input, new CustomError("Розбір вузла синтаксичного дерева")))(input);
}
export function listOfEntries(input, context, entryParser) {
    const entries = [];
    let rest = input;
    let newContext = context;
    while (true) {
        const entryResult = entryParser(rest, newContext);
        if (entryResult.isErr()) {
            if (entries.length === 0) {
                return new Ok([rest, [entries, newContext]]);
            }
            return new Err(new ParseError(`елемент переліку (${entryResult.unwrapErr()})`, rest, new CustomError("Розбір елементу переліку")));
        }
        const [rest2, [entry, newContext1]] = entryResult.unwrap();
        entries.push(entry);
        rest = rest2;
        newContext = newContext1;
        const sepResult = pair(tag(","), whitespaceOffset)(rest);
        if (sepResult.isErr()) {
            break;
        }
        const [rest3, [, offset]] = sepResult.unwrap();
        rest = rest3;
        newContext = newContext.addColumns(1).addRows(offset.rows).addColumns(offset.columns);
    }
    return new Ok([rest, [entries, newContext]]);
}
//# sourceMappingURL=composite_parsers.js.map
