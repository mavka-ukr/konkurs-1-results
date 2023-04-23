import fs from 'fs';

function translit(value) {
    return value
        .replaceAll("a", "а").replaceAll("А", "А")
        .replaceAll("b", "б").replaceAll("B", "Б")
        .replaceAll("c", "ц").replaceAll("C", "Ц")
        .replaceAll("d", "д").replaceAll("D", "Д")
        .replaceAll("e", "е").replaceAll("E", "Е")
        .replaceAll("f", "ф").replaceAll("F", "Ф")
        .replaceAll("g", "г").replaceAll("G", "Г")
        .replaceAll("h", "х").replaceAll("H", "Х")
        .replaceAll("i", "і").replaceAll("I", "І")
        .replaceAll("j", "ї").replaceAll("J", "Ї")
        .replaceAll("k", "к").replaceAll("K", "К")
        .replaceAll("l", "л").replaceAll("L", "Л")
        .replaceAll("m", "м").replaceAll("M", "М")
        .replaceAll("n", "н").replaceAll("N", "Н")
        .replaceAll("o", "о").replaceAll("O", "О")
        .replaceAll("p", "п").replaceAll("P", "П")
        .replaceAll("q", "к").replaceAll("Q", "К")
        .replaceAll("r", "р").replaceAll("R", "Р")
        .replaceAll("s", "с").replaceAll("S", "С")
        .replaceAll("t", "т").replaceAll("T", "Т")
        .replaceAll("u", "у").replaceAll("U", "У")
        .replaceAll("v", "в").replaceAll("V", "В")
        .replaceAll("w", "в").replaceAll("W", "В")
        .replaceAll("x", "х").replaceAll("X", "Х")
        .replaceAll("y", "и").replaceAll("Y", "И")
        .replaceAll("z", "з").replaceAll("Z", "З")
        .replaceAll("\\н", "\\n");
}

function jsonToDid(value, obj = false) {
    if (value == null) {
        return 'пусто';
    }

    if (typeof value === 'number') {
        return `${value}`;
    }

    if (typeof value === 'string') {
        value = translit(value.replaceAll("\r\n", "\\n").replaceAll("\n", "\\n"));
        return `"${value}"`;
    }

    if (typeof value === 'boolean') {
        return value ? 'так' : 'ні';
    }

    if (Array.isArray(value)) {
        return `[${value.map((v) => jsonToDid(v)).join(', ')}]`;
    }

    if (typeof value === 'object') {
        if (obj) {
            return `Обʼєкт(${Object.entries(value).map(([key, value]) => `${translit(key)}=${jsonToDid(value)}`).map((v) => "\n  " + v).join(", ")}
)
`;
        }

        return `(${Object.entries(value).map(([key, value]) => `"${translit(key)}"=${jsonToDid(value)}`).map((v) => "\n  " + v).join(", ")}
)
`;
    }
}

const jsonData = fs.readFileSync('./_data/db.json', 'utf8');
const data = JSON.parse(jsonData);

const didData = jsonToDid(data, false);
fs.writeFileSync('./_data/_.дід', didData);
