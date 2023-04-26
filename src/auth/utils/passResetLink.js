require('dotenv').config();
const mailgunSetup = require('../../utils/mailgun');
const text = require('./text')

module.exports = async (user, res) => {

    const configData = {
        name: process.env.NAME,
        bio: "",
        bg: process.env.BRAND_COLOR,
    }


    const URL = `${process.env.FRONTEND_BASE_URL}/${process.env.RESET_PASSWORD_URL}/${user.passwordReset.token}`

    if (process.env.ENV !== 'develpoment') {

        const email_data = {
            from: `${configData.name} <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Reset Your Password',
            html: text.linkText(configData.name, configData.bio, URL, 'password', "Click to Reset your Password")
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
                // save the user inthe collection
                await user.passwordReset.save()
                return res.status(200).json({ status: true, msg: `Check your email (${user.email}) to reset your password` });
            }
        })

    } else {
        user.passwordReset.save()
        return res.status(200).json({
            status: true,
            msg: `On development mode! Please check below to reset your password`,
            token: user.passwordReset.token,
        })

    }
}