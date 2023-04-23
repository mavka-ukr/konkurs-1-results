import ASTNode from "./ASTNode.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { recognize, pair, opt, alt, tuple, map } from "../util_parsers/combinator.js";
import { numeric1, tag } from "../util_parsers/basic.js";
import { Err, Ok } from "../result.js";
export default class NumberNode extends ASTNode {
    number;
    constructor(number, context) {
        super(context);
        this.number = number;
    }
    static parse(input, context) {
        const parseResult = parseNumber(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError("число", input, new CustomError("Розбір числового вузла")));
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new NumberNode(n, context), context.addColumns(input.length - rest.length)]]);
    }
    toString() {
        return `NumberNode(${this.number})`;
    }
}
function parseNumber(input) {
    return map(pair(opt(tag('-')), alt(map(recognize(tuple(numeric1, tag('.'), numeric1)), Number.parseFloat), map(recognize(numeric1), Number.parseInt))), ([sign, n]) => sign
        ? -n
        : n)(input);
}
//# sourceMappingURL=NumberNode.js.map
