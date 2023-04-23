/**
 * Represents a successful result of an operation.
 */
export class Ok {
    value;
    constructor(value) {
        this.value = value;
    }
    isOk() {
        return true;
    }
    isErr() {
        return false;
    }
    map(f) {
        return new Ok(f(this.value));
    }
    mapErr(_f) {
        return new Ok(this.value);
    }
    /**
     * Unwraps the value of this result.
     * @throws {Error} If the result is an Err.
     */
    unwrap() {
        return this.value;
    }
    /**
     * Unwraps the error of this result.
     * @throws {Error} If the result is an Ok.
     */
    unwrapErr() {
        throw new Error(`Called Result::unwrapErr() on Ok variant ${this.value}`);
    }
    /**
     * Unwraps the value of this `Result` or returns the provided default value.
     * @param _defaultValue The default value to return if the `Result` is an `Err`. (not used)
     */
    unwrapOr(_defaultValue) {
        return this.value;
    }
    /**
     * Maps the value of this `Result` using the provided function if the `Result` is an `Ok`.
     * Otherwise, returns the original `Err` value.
     *
     * @param f The function to map the value.
     * @returns The result of the function or the original `Err` value.
     */
    flatMap(f) {
        return f(this.value);
    }
    toString() {
        return `Ok(${this.value})`;
    }
}
/**
 * Represents a failed result of an operation.
 */
export class Err {
    error;
    constructor(error) {
        this.error = error;
    }
    /**
     * Returns true if the `Result` is an `Ok`. Otherwise, false.
     */
    isOk() {
        return false;
    }
    /**
     * Returns true if the `Result` is an `Rrr`. Otherwise, false.
     */
    isErr() {
        return true;
    }
    /**
     * Maps the value of this result using the provided function.
     * @param _f The function to map the value. (not used)
     */
    map(_f) {
        return new Err(this.error);
    }
    /**
     * Maps the error of this result using the provided function.
     * @param f The function to map the error.
     */
    mapErr(f) {
        return new Err(f(this.error));
    }
    /**
     * Unwraps the value of this `Result`.
     * @throws {Error} If the value is an `Err`.
     */
    unwrap() {
        throw new Error(`Called Result::unwrap() on err variant: ${this.error}`);
    }
    /**
     * Unwraps the error of this `Result`.
     * @throws {Error} If the value is an `Ok`.
     */
    unwrapErr() {
        return this.error;
    }
    /**
     * Unwraps the value of this `Result` or returns the provided default value.
     * @param defaultValue The default value to return if the `Result` is an `Err`.
     */
    unwrapOr(defaultValue) {
        return defaultValue;
    }
    /**
     * Maps the value of this `Result` using the provided function if the `Result` is an `Ok`.
     * @param _f The function to map the value. (not used)
     */
    flatMap(_f) {
        return new Err(this.error);
    }
    toString() {
        return `Err(${this.error})`;
    }
}
//# sourceMappingURL=result.js.map