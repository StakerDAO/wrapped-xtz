const crypto = require('crypto');
const randomBytes = require('random-bytes');

module.exports = {
    toHexString: function(byteArray) {
        return Array.prototype.map.call(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    },
    hexToBytes: function(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    },
    randomSecret: function() {
        const maxByteLength = 32;
        const bytes = randomBytes.sync(maxByteLength);
        return this.toHexString(bytes)
    },
    hash: function(payload) {
        const data = Buffer.from(this.hexToBytes(payload));
        const hash = crypto.createHash('sha256');
        hash.update(data);
        return `${ hash.digest('hex') }`
    },
    randomHash: function() {
        const secret = this.randomSecret();
        return this.hash(secret)
    },
};