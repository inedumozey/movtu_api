const mongoose = require('mongoose')
const Transactions = mongoose.model("transactions");
const Fund = mongoose.model("fund");
const AccountNumber = mongoose.model("accountNumber");

module.exports = {
    generateAccountNumber: async (req, res) => {
        try {
            // const data = await Transactions.find({})

            return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }
    }
}
