const mongoose = require('mongoose')
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = {

    activatedUserAuth: async (req, res, next) => {
        try {
            const authToken = req.headers["authorization-access"];

            if (!authToken) {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login or register" })
            }
            // Verify token
            const token = authToken.split(" ")[1]
            // Verify token

            if (!token) {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login or register" })
            }

            const data = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)

            if (!data) {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login or register" })
            }

            // Use the data to get the user from User collection
            const user = await User.findOne({ _id: data.id });

            if (!user.isVerified) {
                return res.status(402).json({ status: false, msg: "Your account is not activated, please verify your account" })
            }

            if (user.isVerified) {
                req.user = user.id

                next()
            }
            else {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login or register" })
            }
        }
        catch (err) {
            if (err.message == 'invalid signature' || err.message == 'invalid token' || err.message === 'jwt malformed' || err.message === "jwt expired") {
                return res.status(402).json({ status: false, msg: "You are not authorized! Please login or register" })

            }
            return res.status(500).json({ status: false, msg: err.message })
        }
    },

    adminAuth: async (req, res, next) => {
        try {
            const authToken = req.headers["authorization-admin"];
            const accessToken = req.headers["authorization-access"];

            if (!authToken && !accessToken) {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login as admin" })
            }
            // Verify token
            const token = authToken.split(" ")[1]
            const access_token = accessToken.split(" ")[1]
            // Verify token
            if (!token || !access_token) {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login as admin" })
            }

            const data = await jwt.verify(token, process.env.JWT_ADMIN_SECRET)
            const access_data = await jwt.verify(access_token, process.env.JWT_ACCESS_SECRET)

            if (!data && !access_data) {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login as admin" })
            }

            // Use the data to get the user from User collection
            const user = await User.findOne({ _id: data.id });

            if (!user.isVerified) {
                return res.status(402).json({ status: false, msg: "Your account is not activated, please verify your account" })
            }

            if (user.role.toLowerCase() !== 'admin') {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login as an admin" })
            }

            if (user.role.toLowerCase() === 'admin') {
                req.user = user.id
                next()
            }
            else {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login as admin" })
            }
        }
        catch (err) {
            if (err.message == 'invalid signature' || err.message == 'invalid token' || err.message === 'jwt malformed' || err.message === "jwt expired") {
                return res.status(402).json({ status: false, msg: "You are not authorized, please login as admin" })

            }
            return res.status(500).json({ status: false, msg: err.message })
        }
    },
}