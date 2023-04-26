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

    }
)

mongoose.model("accountNumber", schema);