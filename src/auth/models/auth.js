const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        username: {
            type: String,
            trim: true,
            default: null
        },
        accountNumber: {
            type: String,
            default: null
        },
        password: {
            type: String,
            require: true,
            trim: true
        },
        role: {
            type: String,
            default: "RESELLER", // ADMIN
            trim: true,
        },
        isVerified: {
            type: Boolean,
            trim: true,
            default: false
        },
        isBlocked: {
            type: Boolean,
            trim: true,
            default: false
        },
        balance: {
            type: Number,
            trim: true,
            default: 0
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("User", schema);