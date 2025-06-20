/**
 * The Box–Muller transform is a random number sampling method for generating pairs of independent, standard, normally distributed random numbers
 */
function randomBoxMuller() {
    let u = 0;
    let v = 0;
    while (u === 0)
        u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0)
        v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0)
        return randomBoxMuller(); // resample between 0 and 1
    return num;
}
export function generateUuid() {
    return crypto.randomUUID();
}
export function normalizedRandom(maxValue) {
    return Math.floor(randomBoxMuller() * maxValue);
}
/**
 * Return a random element from the array
 */
export function randomOneOf(items) {
    if (items.length === 0) {
        throw new Error('Cannot return random object out of empty list');
    }
    return items[(items.length * Math.random()) | 0];
}
export function getRandomNumber(xInclusive) {
    return Math.floor(Math.random() * (xInclusive + 1));
}
//# sourceMappingURL=randomUtils.js.map