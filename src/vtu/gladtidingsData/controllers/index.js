const mongoose = require('mongoose')
const User = mongoose.model("User");
const Transactions = mongoose.model("transactions");
const axios = require("axios")
require("dotenv").config()
const G_TOKEN = process.env.GLADTIDINGSDATA_TOKEN

require("dotenv").config();

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const ran = require('../../../auth/utils/randomString')

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports = {
    getUserDetails: async (req, res) => {
        try {
            let { data } = await axios.post("https://www.gladtidingsdata.com/api/user/", {}, {
                headers: { Authorization: `Token ${G_TOKEN}` }
            })

            data = {
                balance: data.user.Account_Balance,
                name: 'Gladtidingsdata',
                banks: data.user.bank_accounts.accounts
            }

            return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }
    },

    getAllDataPlans: async (req, res) => {
        try {
            // let { data } = await axios.post("https://subkonnect.com/api/data/", {}, {
            //     headers: { Authorization: `Token ${G_TOKEN}` }
            // })

            var config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: 'https://subkonnect.com/api/data/',
                headers: { Authorization: `Bearer ${G_TOKEN}` }
            };

            axios(config)
                .then(function (response) {
                    console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                    console.log(error);
                });

            // return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }
    },

    buyData: async (req, res) => {
        try {
            const { mobile_number, plan, payment_medium } = req.body
            if (!mobile_number || !plan) {
                return res.status(500).json({ status: false, msg: "Required!" })
            }

            let { data } = await axios.post("https://www.gladtidingsdata.com/api/data/",
                {
                    mobile_number,
                    plan,
                    Ported_number: true,
                    payment_medium
                },
                {
                    headers: { Authorization: `Token ${G_TOKEN}` }
                })

            return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }
    },

    getAllAirtimePlans: async (req, res) => {
        try {
            const data = await User.find({})
                .select("-password");

            return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }
    },

    buyAirtime: async (req, res) => {
        try {
            const { mobile_number, network, amount } = req.body
            if (!mobile_number || !network || !amount) {
                return res.status(500).json({ status: false, msg: "Required!" })
            }

            let { data } = await axios.post("https://www.gladtidingsdata.com/api/topup/",
                {
                    mobile_number,
                    network,
                    amount,
                    Ported_number: true,
                    airtime_type: 'VTU'
                },
                {
                    headers: { Authorization: `Token ${G_TOKEN}` }
                })

            return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }
    }
}




