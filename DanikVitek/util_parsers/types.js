export class CustomError {
    msg;
    constructor(msg) {
        this.msg = msg;
    }
    toString() {
        return this.msg;
    }
}
export class ParseError {
    expected;
    kind;
    inputStart;
    constructor(expected, input, kind) {
        this.expected = expected;
        this.kind = kind;
        this.inputStart = input.slice(0, 5) + (input.length > 5 ? "..." : "");
    }
    toString() {
        const kind = this.kind
            ? ` (${this.kind})`
            : "";
        return `Помилка розбирача${kind}: Очікувалося '${this.expected}', але отримали '${this.inputStart}'`;
    }
}
//# sourceMappingURL=types.js.map