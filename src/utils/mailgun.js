const mailgun = require("mailgun-js")

const mailgunSetup = mailgun({
    apiKey: process.env.API_KEY_MAILGUN,
    domain: process.env.DOMAIN_MAILGUN
});

module.exports = mailgunSetup