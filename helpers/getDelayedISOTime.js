function convertMinutes(totalMinutes) {
    const hoursWithRemainder = (totalMinutes / 60);
    // remove hours remainder by rounding down
    const hours = Math.floor(hoursWithRemainder);
    const minutesWithRemainder = (hoursWithRemainder - hours) * 60;
    // remove minutes remainder by rounding up
    const minutes = Math.round(minutesWithRemainder);
    return { hours, minutes }
};

module.exports = (totalMinutes) => {
    const { hours, minutes } = convertMinutes(totalMinutes);
    const timeNow = new Date();
    // set new time
    const delayedHour = timeNow.getHours() + hours;
    const delayedMinutes = timeNow.getMinutes() + minutes;
    timeNow.setHours(delayedHour, delayedMinutes);
    // Remove milliseconds for Tezos protocol
    timeNow.setMilliseconds(000);
    const timeWithDelay = timeNow.toISOString();
    return timeWithDelay
};
