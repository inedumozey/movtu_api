const mongoose = require('mongoose');
const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        ref: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        previousBalance: {
            type: Number,
            required: true,
        },
        currentBalance: {
            type: Number,
            required: true,
        },

    }
)

mongoose.model("fund", schema);