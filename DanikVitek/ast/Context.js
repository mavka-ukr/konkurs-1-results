import { whitespace0 } from "../util_parsers/basic.js";
import { map } from "../util_parsers/combinator.js";
export default class Context {
    row;
    col;
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    /**
     * Add columns to context without changing row
     * @param cols number of columns to add
     * @return {Context} new context
     */
    addColumns(cols) {
        if (cols < 0) {
            throw new Error("Cannot add negative number of columns");
        }
        return new Context(this.row, this.col + cols);
    }
    /**
     * Add rows to context, reset column to 0 if rows > 0
     * @param rows number of rows to add
     * @return {Context} new context
     */
    addRows(rows) {
        if (rows < 0) {
            throw new Error("Cannot add negative number of rows");
        }
        return new Context(this.row + rows, rows === 0
            ? this.col
            : 0);
    }
}
function isDefined(t) {
    return t !== undefined;
}
export function whitespaceOffset(input) {
    return map(whitespace0, ws => {
        const split = ws.split(/\n|(\r\n)/).filter(isDefined);
        return {
            rows: split.length - 1,
            columns: split[split.length - 1].length,
        };
    })(input);
}
//# sourceMappingURL=Context.js.map
