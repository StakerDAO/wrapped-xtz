module.exports = (minutes) => {
    let unixEpoch = Date.now();
    const delayInMilliseconds = minutes * 60 * 1000;
    unixEpoch += delayInMilliseconds;
    const timeWithDelay = new Date(unixEpoch);
    // Remove milliseconds for Tezos protocol
    timeWithDelay.setMilliseconds(000);
    return timeWithDelay.toISOString()
};
