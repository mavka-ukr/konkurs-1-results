import ASTNode from "./ASTNode.js";
import { CustomError, ParseError } from "../util_parsers/types.js";
import { Err, Ok } from "../result.js";
import { tag } from "../util_parsers/basic.js";
export default class EmptyNode extends ASTNode {
    constructor(context) {
        super(context);
    }
    static parse(input, context) {
        const parseResult = tag("пусто")(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError("пусто", input, new CustomError("Розбір вузла 'пусто'")));
        }
        const [rest] = parseResult.unwrap();
        return new Ok([rest, [new EmptyNode(context), context.addColumns(5)]]);
    }
    toString() {
        return `EmptyNode()`;
    }
}
//# sourceMappingURL=EmptyNode.js.map
