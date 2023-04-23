import ASTNode from "./ASTNode.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { tag } from "../util_parsers/basic.js";
import { alt, value } from "../util_parsers/combinator.js";
import { Err, Ok } from "../result.js";
export default class LogicalNode extends ASTNode {
    value;
    constructor(value, context) {
        super(context);
        this.value = value;
    }
    static parse(input, context) {
        const parseResult = parseBool(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError('"так" або "ні"', input, new CustomError("Розбір логічного вузла")));
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new LogicalNode(n, context), context.addColumns(input.length - rest.length)]]);
    }
    toString() {
        return `LogicalNode(${this.value})`;
    }
}
function parseBool(input) {
    return alt(value(tag("так"), true), value(tag("ні"), false))(input);
}
//# sourceMappingURL=LogicalNode.js.map
