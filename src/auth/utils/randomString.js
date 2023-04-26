const crypto = require('crypto')

const ran = {
    random_id: () => {
        const arr = [];
        const length = 6;
        for (let i = 0; i <= length; i++) {
            arr.push(Math.floor(Math.random() * length))
        }
        return `${arr.join('')}`
    },
    token: () => {
        const arr = [];
        const length = 3;
        for (let i = 0; i <= length; i++) {
            arr.push(Math.floor(Math.random() * length)) // 4 digits
        }
        return `${arr.join('')}`
    },
    resetToken: () => crypto.randomBytes(64).toString('base64url'),
}

module.exports = ran