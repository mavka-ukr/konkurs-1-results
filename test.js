import fs from 'fs';
import { runBenchmark } from "./benchmark.js";
import { parse as kant2002parse } from "./kant2002/index.js";
import { parse as romanfedyniakparse } from "./romanfedyniak/index.js";
import { parse as ArtemiiKravchukparse } from "./ArtemiiKravchuk/index.js";
import { parse as DanikVitekparse } from "./DanikVitek/index.js";

const winners = {};

function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename);
    return stats.size;
}

function getFilesizeInKilobytes(filename) {
    return getFilesizeInBytes(filename) / 1000;
}

const ITERATIONS = 10;

function testUser(user, parser, dataName, data) {
    if (!(dataName in winners)) {
        winners[dataName] = {};
    }
    try {
        const result = runBenchmark(parser, [data], ITERATIONS);
        console.log(`[${dataName}] ${user} = ${result} ms`);
        winners[dataName][user] = result;
    } catch (e) {
        console.log(`[${dataName}] ${user} = FAILED`);
    }
}

function testAllUsers(dataName, data) {
    testUser('kant2002', kant2002parse, dataName, data);
    testUser('romanfedyniak', romanfedyniakparse, dataName, data);
    testUser('ArtemiiKravchuk', ArtemiiKravchukparse, dataName, data);
    testUser('DanikVitek', DanikVitekparse, dataName, data);
}

function testDataFile(dataName) {
    console.log(`${dataName}: ${getFilesizeInKilobytes('./_data/' + dataName)} KB`);
    const data = fs.readFileSync('./_data/' + dataName, 'utf8');
    testAllUsers(dataName, data);
}

testDataFile('словник.дід');
console.log('');
testDataFile('список.дід');
console.log('');
testDataFile('число.дід');
console.log('');
testDataFile('текст.дід');
console.log('');
testDataFile('логічне.дід');
console.log('');
testDataFile('Обʼєкт.дід');
console.log('');
testDataFile('база.дід');
console.log('');
testDataFile('база1.дід');
console.log('');
testDataFile('база2.дід');
console.log('');
testDataFile('база3.дід');
console.log('');
testDataFile('база4.дід');

const results = Object.entries(winners).map(([k, v]) => ({
    test: k,
    results: Object.entries(v).map(([rk, rv]) => ({ name: rk, value: rv })).sort((a, b) => a.value - b.value)
}));

const userResults = {};


results.forEach((r) => {
    r.results.forEach((rr) => {
        if (!(rr.name in userResults)) {
            userResults[rr.name] = 0;
        }
        userResults[rr.name] += rr.value;
    });
});

const table = Object.entries(userResults).map(([k, v]) => ({ name: k, value: v })).sort((a, b) => a.value - b.value);

console.log(table);
