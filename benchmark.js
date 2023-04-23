export function runBenchmark(fn, params, it) {
    let total = 0;

    for (let i = 0; i < it; i++) {
        const t0 = performance.now();
        fn(...params);
        const t1 = performance.now();
        total += (t1 - t0);
    }

    return total / it;
}
