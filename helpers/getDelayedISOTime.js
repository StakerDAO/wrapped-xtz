module.exports = (hours) => {
    const timeNow = new Date();
    timeNow.setHours( timeNow.getHours() + hours);
    // Remove milliseconds for Tezos protocol
    timeNow.setMilliseconds(000);
    const timeWithDelay = timeNow.toISOString();
    return timeWithDelay
};