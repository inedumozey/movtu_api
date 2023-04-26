require('dotenv').config();
const mailgunSetup = require('../../utils/mailgun');
const text = require('./text')

module.exports = async (email, res, verificationCode) => {

    const configData = {
        name: process.env.NAME,
        bio: "",
        bg: process.env.BRAND_COLOR,
    }

    if (process.env.ENV !== 'develpoment') {

        const email_data = {
            from: `${configData.name} <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verification Code',
            html: text.linkText(configData.name, configData.bio, '', '', verificationCode)
        }

        mailgunSetup.messages().send(email_data, async (err, resp) => {
            if (err) {
                if (err.message.includes("ENOTFOUND") || err.message.includes("EREFUSED") || err.message.includes("EHOSTUNREACH")) {
                    return res.status(408).json({ status: false, msg: "No network connectivity" })
                }
                else if (err.message.includes("ETIMEDOUT")) {
                    return res.status(408).json({ status: false, msg: "Request Time-out! Check your network connections" })
                }
                else {
                    return res.status(500).json({ status: false, msg: err.message })
                }
            }
            else {

                await verificationCode.save()
                return res.status(200).json({
                    status: true,
                    msg: `Verification code sent to your email`,
                    token: ''
                })
            }
        })

    } else {
        await verificationCode.save()
        return res.status(200).json({
            status: true,
            msg: `On development mode! verification code: ${(verificationCode.verificationCode)}`,
            token: verificationCode.verificationCode
        })
    }
}