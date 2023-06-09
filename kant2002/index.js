export class NumberNode {
    constructor(value) {
        this._value = value;
    }
    get value() {
        return this._value;
    }
}
export class LogicalNode {
    constructor(value) {
        this._value = value;
    }
    get value() {
        return this._value;
    }
}
class EmptyNode {
    constructor() {
    }
}
EmptyNode.instance = new EmptyNode();
export { EmptyNode };
export class TextNode {
    constructor(value) {
        this._value = value;
    }
    get value() {
        return this._value;
    }
}
export class ObjectEntryNode {
    constructor(key, value) {
        this._key = key;
        this._value = value;
    }
    get key() {
        return this._key;
    }
    get value() {
        return this._value;
    }
}
export class ObjectNode {
    constructor(type, elements) {
        this._type = type;
        this._elements = elements;
    }
    get type() {
        return this._type;
    }
    get elements() {
        return this._elements;
    }
}
export class ListNode {
    constructor(elements) {
        this._elements = elements;
    }
    get elements() {
        return this._elements;
    }
}
export class DictionaryEntryNode {
    constructor(key, value) {
        this._key = key;
        this._value = value;
    }
    get key() {
        return this._key;
    }
    get value() {
        return this._value;
    }
}
export class DictionaryNode {
    constructor(elements) {
        this._elements = elements;
    }
    get elements() {
        return this._elements;
    }
}
const TOKEN_TYPES = [
    { name: 'IDENTIFIER', pattern: /^[a-zA-Zа-яА-ЯіІҐґЇїєЄ_][0-9a-zA-Zа-яА-ЯіІҐґЇїєЄʼ'_]*/ },
];
const FAST_TOKEN_TYPES = [
    { name: 'EQUALS', pattern: "=" },
    { name: 'LPAREN', pattern: "(" },
    { name: 'RPAREN', pattern: ")" },
    { name: 'LBRACKET', pattern: "[" },
    { name: 'RBRACKET', pattern: "]" },
    { name: 'COMMA', pattern: "," },
];
function isNumber(char) {
    return char >= "0" && char <= "9";
}
class Token {
    constructor(type, value, range) {
        this.type = type;
        this.value = value;
        this.range = range;
    }
}
export class Lexer {
    constructor(inputString) {
        this.inputString = inputString;
        this.line = 1;
        this.column = 1;
        this.position = 0;
    }
    getNextToken() {
        if (this.position >= this.inputString.length) {
            return new Token('EOF', null, {
                start: {
                    line: this.line,
                    column: this.column,
                },
                end: {
                    line: this.line,
                    column: this.column,
                }
            });
        }
        const range = {
            start: {
                line: this.line,
                column: this.column,
            },
            end: {
                line: this.line,
                column: this.column,
            }
        };
        const value = this.inputString[this.position];
        for (const tokenType of FAST_TOKEN_TYPES) {
            if (value === tokenType.pattern) {
                return this.produceToken(tokenType.name, value, range);
            }
        }
        if (value === ' ' || value === '\t') {
            return this.produceToken('WHITESPACE', value, range);
        }
        if (value === '\n' || value === '\r') {
            this.line++;
            range.end.column = 1;
            range.end.line = this.line;
            this.position += 1;
            this.column = 1;
            if (value === '\r') {
                const value2 = this.peek();
                if (value2 === '\n') {
                    this.position += 1;
                    return new Token('NEWLINE', value + value2, range);
                }
            }
            return new Token('NEWLINE', value, range);
        }
        if (value === '"') {
            return this.consumeStringToken(value, range);
        }
        if (value === '-' || isNumber(value)) {
            return this.consumeNumber(value, range);
        }
        // This is still faster then manually processing symbols.
        // looks like more complex regular expressions beneficial to parsing
        for (const tokenType of TOKEN_TYPES) {
            const regex = tokenType.pattern;
            const match = this.inputString.slice(this.position).match(regex);
            if (match) {
                const value = match[0];
                range.end.column += value.length;
                const token = new Token(tokenType.name, value, range);
                this.position += value.length;
                this.column += value.length;
                return token;
            }
        }
        throw new Error(`Неочіковані дані на рядку: ${this.line} стовпець: ${this.column}: ${this.inputString.slice(this.position)}`);
    }
    consumeStringToken(value, range) {
        this.position++;
        this.column++;
        let currentChar = this.peek();
        let textContent = '';
        while (currentChar !== '"') {
            if (currentChar === '\\') {
                // Process escape character
                this.position++;
                this.column++;
                const escapedChar = this.peek();
                switch (escapedChar) {
                    case 't':
                        textContent += '\t';
                        break;
                    case 'r':
                        textContent += '\r';
                        break;
                    case 'n':
                        textContent += '\n';
                        break;
                    case '"':
                        textContent += '\"';
                        break;
                    case '\\':
                        textContent += '\\';
                        break;
                    case '0':
                        textContent += '\0';
                        break;
                    case 'b':
                        textContent += '\b';
                        break;
                    case 'f':
                        textContent += '\f';
                        break;
                    case '\'':
                        textContent += '\'';
                        break;
                    default:
                        throw new Error(`Unexpected escape sequence \\${escapedChar}`);
                }
            }
            else {
                textContent += currentChar;
            }
            this.position++;
            this.column++;
            currentChar = this.peek();
        }
        this.position++;
        this.column++;
        range.end.column = this.column;
        return new Token('STRING', textContent, range);
    }
    consumeNumber(value, range) {
        let numberContent = value;
        let digitRequired = value === '-';
        let dotAllowed = true;
        this.position++;
        this.column++;
        let currentChar = this.peek();
        while (isNumber(currentChar) || currentChar === '.') {
            if (currentChar === '.') {
                if (dotAllowed) {
                    dotAllowed = false;
                }
                else {
                    throw new Error(`У числі не повинно бути двох точок`);
                }
            }
            numberContent += currentChar;
            digitRequired = false;
            this.position++;
            this.column++;
            currentChar = this.peek();
        }
        if (digitRequired) {
            throw new Error(`На рядку ${this.line} та стовпчику ${this.column} очікувалася цифра, замість того ${currentChar}`);
        }
        range.end.column = this.column;
        return new Token('NUMBER', numberContent, range);
    }
    peek() {
        if (this.position < this.inputString.length) {
            return this.inputString[this.position];
        }
        return "\0";
    }
    tryConsumeChar(char) {
        const value2 = this.peek();
        if (value2 === char) {
            this.position += 1;
            this.column += 1;
            return true;
        }
        return false;
    }
    produceToken(tokenName, value, range) {
        range.end.column += 1;
        const token = new Token(tokenName, value, range);
        this.position += 1;
        this.column += 1;
        return token;
    }
}
export class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }
    currentTokenType() {
        return this.currentToken.type;
    }
    tryConsume(type) {
        if (this.currentToken.type === type) {
            // console.log(`Consume ${type}, ${this.поточнийТокен.value}`);
            this.currentToken = this.lexer.getNextToken();
            return true;
        }
        else {
            return false;
        }
    }
    consume(type, skipWhitespaces = true) {
        if (!this.tryConsume(type)) {
            throw new Error(`Unexpected token: ${this.currentToken.type} (expected ${type})`);
        }
        if (skipWhitespaces) {
            while (this.tryConsume('WHITESPACE') || this.tryConsume('NEWLINE')) {
            }
        }
    }
    parse() {
        return this.parseValue();
    }
    parseBool() {
        if (this.currentToken.type !== 'IDENTIFIER') {
            throw new Error(`Unexpected token: ${this.currentToken.type}`);
        }
        if (this.currentToken.value !== 'так' && this.currentToken.value !== 'ні') {
            throw new Error(`Unexpected bool value, but ${this.currentToken.value} was given`);
        }
        const value = this.currentToken.value === 'так';
        this.consume('IDENTIFIER');
        return new LogicalNode(value);
    }
    parseValue() {
        let propertyValue;
        if (this.currentToken.type === 'STRING') {
            return this.parseTextNode();
        }
        else if (this.currentToken.type === 'NUMBER') {
            return this.parseNumberNode();
        }
        else if (this.currentToken.type === 'IDENTIFIER') {
            const identifier = this.currentToken.value;
            if (identifier === 'так' || identifier === 'ні') {
                propertyValue = this.parseBool();
                if (this.currentTokenType() === 'LPAREN') {
                    const елементи = this.parseObjectEntryNodes();
                    propertyValue = new ObjectNode(identifier, елементи);
                }
            }
            else if (identifier === 'пусто') {
                propertyValue = EmptyNode.instance;
                this.consume('IDENTIFIER');
                if (this.currentTokenType() === 'LPAREN') {
                    const елементи = this.parseObjectEntryNodes();
                    propertyValue = new ObjectNode(identifier, елементи);
                }
            }
            else {
                this.consume('IDENTIFIER');
                const елементи = this.parseObjectEntryNodes();
                propertyValue = new ObjectNode(identifier, елементи);
            }
        }
        else if (this.currentToken.type === 'LBRACKET') {
            return this.parseList();
        }
        else if (this.currentToken.type === 'LPAREN') {
            return this.parseDictionary();
        }
        else {
            throw new Error(`Неочікуваний токен: ${this.currentToken.value} на рядку: ${this.currentToken.range.start.line} стовпець: ${this.currentToken.range.start.column}`);
        }
        return propertyValue;
    }
    parseNumberNode() {
        const propertyValue = new NumberNode(parseFloat(this.currentToken.value));
        this.consume(this.currentToken.type);
        return propertyValue;
    }
    parseTextNode() {
        const propertyValue = new TextNode(this.currentToken.value);
        this.consume(this.currentToken.type);
        return propertyValue;
    }
    parseObject() {
        const typeName = this.currentToken.value;
        this.consume('IDENTIFIER');
        const елементи = this.parseObjectEntryNodes();
        return new ObjectNode(typeName, елементи);
    }
    parseObjectEntryNodes() {
        this.consume('LPAREN');
        const elements = [];
        while (this.currentToken.type !== 'RPAREN') {
            const propertyName = this.currentToken.value;
            this.consume('IDENTIFIER');
            this.consume('EQUALS');
            let propertyValue = this.parseValue();
            elements.push(new ObjectEntryNode(propertyName, propertyValue));
            if (this.currentToken.type === 'COMMA') {
                this.consume('COMMA');
            }
            else if (this.currentTokenType() !== 'RPAREN') {
                throw new Error(`Очікувалася кома. Замість цього на рядку ${this.currentToken.range.start.line} стовпець ${this.currentToken.range.start.column} знаходиься '${this.currentToken.value}'`);
            }
        }
        this.consume('RPAREN');
        return elements;
    }
    parseList() {
        this.consume('LBRACKET');
        const elemets = [];
        while (this.currentToken.type !== 'RBRACKET') {
            let value = this.parseValue();
            elemets.push(value);
            if (this.currentToken.type === 'COMMA') {
                this.consume('COMMA');
            }
            else if (this.currentTokenType() !== 'RBRACKET') {
                throw new Error(`Очікувалася кома. Замість цього на рядку ${this.currentToken.range.start.line} стовпець ${this.currentToken.range.start.column} знаходиься '${this.currentToken.value}'`);
            }
        }
        this.consume('RBRACKET');
        return new ListNode(elemets);
    }
    parseDictionary() {
        this.consume('LPAREN');
        const elements = [];
        while (this.currentToken.type !== 'RPAREN') {
            let propertyName;
            const tokenText = this.currentToken.value;
            if (this.currentToken.type === 'IDENTIFIER') {
                propertyName = new TextNode(tokenText);
                this.consume('IDENTIFIER');
            }
            else if (this.currentToken.type === 'STRING') {
                propertyName = this.parseTextNode();
            }
            else if (this.currentToken.type === 'NUMBER') {
                propertyName = this.parseNumberNode();
            }
            else {
                throw new Error(`Очікувався ідентіфікатор, або строка або число. На рядку ${this.currentToken.range.start.line} стотвпець ${this.currentToken.range.start.line} знаходиься '${this.currentToken.value}'`);
            }
            this.consume('EQUALS');
            let propertyValue = this.parseValue();
            elements.push(new DictionaryEntryNode(propertyName, propertyValue));
            if (this.currentTokenType() === 'COMMA') {
                this.consume('COMMA');
            }
            else if (this.currentTokenType() !== 'RPAREN') {
                throw new Error(`Очікувалася кома. Замість цього на рядку ${this.currentToken.range.start.line} стовпець ${this.currentToken.range.start.column} знаходиься '${this.currentToken.value}'`);
            }
        }
        this.consume('RPAREN');
        return new DictionaryNode(elements);
    }
}
export function parse(inputString) {
    const lexer = new Lexer(inputString);
    const parser = new Parser(lexer);
    return parser.parse();
}
