const mongoose = require('mongoose')
const Transactions = mongoose.model("transactions");

module.exports = {
    transactions: async (req, res) => {
        try {
            // const data = await Transactions.find({})

            return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }
    }
}
