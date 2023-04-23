import { Err, Ok } from "../result.js";
import { tag } from "../util_parsers/basic.js";
import { pair, withError } from "../util_parsers/combinator.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import ASTNode from "./ASTNode.js";
import { listOfEntries } from "./composite_parsers.js";
import { whitespaceOffset } from "./Context.js";
import DictionaryEntryNode from "./DictionaryEntryNode.js";
export default class DictionaryNode extends ASTNode {
    entries;
    constructor(entries, context) {
        super(context);
        this.entries = entries;
    }
    static parse(input, context) {
        const parseResult = parseDictionary(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError("словник", input, new CustomError("Розбір словника")));
        }
        const [rest, [entries, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new DictionaryNode(entries, context), newContext]]);
    }
    toString() {
        return `DictionaryNode(${this.entries})`;
    }
}
function parseDictionary(input, context) {
    const startParser = withError(pair(tag('('), whitespaceOffset), new ParseError('(', input, new CustomError("Розбір початку словника")))(input);
    if (startParser.isErr()) {
        return new Err(startParser.unwrapErr());
    }
    const [rest, [, offset]] = startParser.unwrap();
    let newContext = context.addColumns(1).addRows(offset.rows).addColumns(offset.columns);
    const entriesParser = listOfDictionaryEntries(rest, newContext);
    if (entriesParser.isErr()) {
        return new Err(entriesParser.unwrapErr());
    }
    const [rest2, [entries, newContext2]] = entriesParser.unwrap();
    const endParser = withError(pair(whitespaceOffset, tag(')')), new ParseError(')', rest2, new CustomError("Розбір кінця словника")))(rest2);
    if (endParser.isErr()) {
        return new Err(endParser.unwrapErr());
    }
    const [rest3, [offset2]] = endParser.unwrap();
    newContext = newContext2.addRows(offset2.rows).addColumns(offset2.columns + 1);
    return new Ok([rest3, [entries, newContext]]);
}
function listOfDictionaryEntries(input, context) {
    return listOfEntries(input, context, DictionaryEntryNode.parse);
}
//# sourceMappingURL=DictionaryNode.js.map
