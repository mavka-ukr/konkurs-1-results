import { Err, Ok } from "../result.js";
import { tag } from "../util_parsers/basic.js";
import { alt, map, tuple, withError } from "../util_parsers/combinator.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import ASTNode from "./ASTNode.js";
import { parseASTNode } from "./composite_parsers.js";
import { whitespaceOffset } from "./Context.js";
import NumberNode from "./NumberNode.js";
import { parseIdent } from "./ObjectEntryNode.js";
import TextNode from "./TextNode.js";
export default class DictionaryEntryNode extends ASTNode {
    key;
    value;
    constructor(key, value, context) {
        super(context);
        this.key = key;
        this.value = value;
    }
    static parse(input, context) {
        const parseResult = parseEntry(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(`запис словника (${parseResult.unwrapErr()})`, input, new CustomError("Розбір запису словника")));
        }
        const [rest, [key, value, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new DictionaryEntryNode(key, value, context), newContext]]);
    }
    toString() {
        return `DictionaryEntryNode({ key: ${this.key}, value: ${this.value} })`;
    }
}
function parseEntry(input, context) {
    const keyResult = withError(alt(map(parseIdent, ident => [new TextNode(ident, context), context.addColumns(ident.length)]), (i => TextNode.parse(i, context)), (i => NumberNode.parse(i, context))), new ParseError("ключ запису словника: текст або число", input, new CustomError("Розбір ключа запису словника")))(input);
    if (keyResult.isErr()) {
        return new Err(keyResult.unwrapErr());
    }
    let [rest, [key, newContext]] = keyResult.unwrap();
    const sepResult = withError(tuple(whitespaceOffset, tag("="), whitespaceOffset), new ParseError('=', rest, new CustomError("Розбір розділювача ('=') запису словника")))(rest);
    if (sepResult.isErr()) {
        return new Err(sepResult.unwrapErr());
    }
    const [rest1, [ws1, , ws2]] = sepResult.unwrap();
    newContext = newContext.addRows(ws1.rows).addColumns(ws1.columns + 1).addRows(ws2.rows).addColumns(ws2.columns);
    const valueResult = parseASTNode(rest1, newContext);
    if (valueResult.isErr()) {
        return new Err(valueResult.unwrapErr());
    }
    const [rest2, [value, newContext1]] = valueResult.unwrap();
    return new Ok([rest2, [key, value, newContext1]]);
}
//# sourceMappingURL=DictionaryEntryNode.js.map
