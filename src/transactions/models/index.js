const mongoose = require('mongoose');
const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            required: true,
        },
        ref: {
            type: String,
            required: true,
        },
        amount: {
            type: String,
            required: true,
        },

    }
)

mongoose.model("transactions", schema);