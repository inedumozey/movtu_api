const mongoose = require('mongoose');
const schema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            require: true,
            trim: true
        },
        verificationCode: {
            type: String,
            required: true,
            unique: true
        },
        createdAt: {
            type: Date,
            expires: '1d', //will be removed after this time (1 day)
            default: Date.now()
        }
    }
)

mongoose.model("VerificationCode", schema);