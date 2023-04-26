const mongoose = require('mongoose')
const User = mongoose.model("User");
const VerificationCode = mongoose.model("VerificationCode");
const PasswordReset = mongoose.model('PasswordReset');

require("dotenv").config();

const bcrypt = require("bcrypt");
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const jwt = require("jsonwebtoken");

const verificationLink = require('../utils/verificationLink');
const passResetLink = require('../utils/passResetLink');
const ran = require('../utils/randomString')
const { generateAccesstoken, generateRefreshtoken, generateAdmintoken } = require('../utils/generateTokens')

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports = {
    fetchUsers: async (req, res) => {
        try {
            const data = await User.find({})
                .select("-password");

            return res.status(200).json({ status: true, msg: "successfull", data })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message })
        }
    },

    fetchUser: async (req, res) => {
        try {
            const { id } = req.params;

            //find user by id
            const data = await User.findOne({ _id: id }).select("-password");

            if (!data) res.status(404).json({ status: false, msg: `User not found!` });

            // send the user 
            return res.status(200).json({ status: true, msg: 'successfull', data });
        }

        catch (err) {
            res.status(500).send({ status: false, msg: msg.message })
        }
    },

    fetchProfile: async (req, res) => {
        try {
            const userId = req.user;

            //find user by id, or email or username
            const data = await User.findOne({ _id: userId }).select("-password");

            if (!data) res.status(404).json({ status: false, msg: `User not found!` });

            // send the user      
            return res.status(200).json({ status: true, msg: 'successfull', data });
        }

        catch (err) {
            res.status(500).send({ status: false, msg: err.message })
        }
    },

    getCode: async (req, res) => {
        try {
            const data = {
                password: DOMPurify.sanitize(req.body.password),
                cPassword: DOMPurify.sanitize(req.body.cPassword),
                email: DOMPurify.sanitize(req.body.email)
            }

            const { email, password, cPassword } = data;

            function checkEmail(email) {

                var filter = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                return filter.test(email) ? true : false
            }

            if (!email || !password) {
                return res.status(400).json({ status: false, msg: "All fields are required!" });
            }

            else if (!checkEmail(email)) {
                return res.status(405).json({ status: false, msg: "Email is invalid!" });
            }

            else if (password.length < 6) {
                return res.status(405).json({ status: false, msg: "Password too short, must not be less than 6 characters" });
            }

            else if (password !== cPassword) {
                return res.status(405).json({ status: false, msg: "Passwords do not match" });
            }

            //get old users
            const oldUser = await User.findOne({ email });

            //check for already existing email who has verified his/her email
            if (oldUser) {
                return res.status(409).json({ status: false, msg: "User already exist!" });
            }

            // check if email already exist in VerificationCode, shuffle the code
            const existingVerificationCode = await VerificationCode.findOne({ email });

            if (existingVerificationCode) {
                const verificationCode = await VerificationCode.findOneAndUpdate({ email }, {
                    verificationCode: ran.token()
                }, { new: true }
                );

                //send account activation link to the user
                verificationLink(email, res, verificationCode);
            }

            else {
                const hashPassword = await bcrypt.hash(password, 10)
                // generate verification code and save in the Code database
                const verificationCode = new VerificationCode({
                    email,
                    role: 'ADMIN',
                    isSupperAdmin: true,
                    verificationCode: ran.token(),
                    password: hashPassword,
                })

                //send account activation link to the user
                verificationLink(email, res, verificationCode);
            }
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message });
        }
    },

    signup: async (req, res) => {
        try {

            const data = {
                verificationCode: DOMPurify.sanitize(req.body.verificationCode)
            }

            const { verificationCode } = data;

            if (!verificationCode) {
                return res.status(400).json({ status: false, msg: "Verification code is missing!" });
            }

            // verify the code
            const code = await VerificationCode.findOne({ verificationCode });

            if (!code) {
                return res.status(400).json({ status: false, msg: "Invalid code" });
            }

            //get old users
            const oldUser = await User.findOne({ email: code.email });

            //check for already existing email who has verified his/her email
            if (oldUser) {
                return res.status(409).json({ status: false, msg: "User already exist!" });
            }

            else {
                // save user data in User database
                const user = new User({
                    email: code.email,
                    password: code.password,
                    isVerified: true
                })

                await user.save();

                // remove the collection from the verifiaction database
                await VerificationCode.findOneAndDelete({ email: code.email });

                // log the user in
                const accesstoken = generateAccesstoken(user._id);
                const refreshtoken = generateRefreshtoken(user._id);
                const admintoken = generateAdmintoken(user._id);

                return res.status(200).json({
                    status: true,
                    msg: "Registration successful and you are logged in",
                    accesstoken,
                    refreshtoken,

                    // xxxxx is admin accesstoken
                    admintoken: user.role.toLowerCase() === 'admin' ? admintoken : '',
                });
            }
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message });
        }
    },

    signin: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ status: false, msg: "All fields are required!" });
            }

            else {
                // find user with username or email
                // get username from the email
                // const email_ = email.split("@")[0] + '@gmail.com'

                // find user with username or email
                const user = await User.findOne({ $or: [{ email }, { username: email }] });

                if (!user) {
                    return res.status(400).json({ status: false, msg: "User not found" });
                }

                // match provided password with the one in database
                const match = await bcrypt.compare(password.toString(), user.password)

                if (!match) {
                    return res.status(400).json({ status: false, msg: "Invalid login credentials" });
                }

                // log the user in
                const accesstoken = generateAccesstoken(user._id);
                const refreshtoken = generateRefreshtoken(user._id);
                const admintoken = generateAdmintoken(user._id);

                return res.status(200).json({
                    status: true,
                    msg: "Your are logged in",
                    accesstoken,
                    refreshtoken,
                    admintoken: user.role.toLowerCase() === 'admin' ? admintoken : '',
                })
            }
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message });
        }
    },

    generateAccesstoken: async (req, res) => {
        try {
            //refresh token passed in req.body from client is used to refresh access token which will then be saved in client token
            const authToken = req.headers["authorization"];

            if (!authToken) {
                return res.status(400).json({ status: false, message: "You are not authorize, please login or register" })
            }

            // Verify token
            const token = authToken.split(" ")[1]

            if (!token) {
                return res.status(400).json({ status: false, msg: "User not authenticated! Please login or register" });
            }

            //validate token
            const data = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);

            if (!data) {
                return res.status(400).json({ status: false, msg: "Invalid token! Please login or register" });
            }

            // find the user
            const user = await User.findOne({ _id: data.id });

            if (!user) {
                return res.status(404).json({ status: false, msg: "User not found" })
            }

            // generate new accesstoken and refreshtoken and send to the client cookie
            const accesstoken = generateAccesstoken(user._id);
            const refreshtoken = generateRefreshtoken(user._id);
            const admintoken = generateAdmintoken(user._id);

            return res.status(200).json({
                status: true,
                msg: "Access token refreshed",
                accesstoken,
                refreshtoken,

                // xxxxx is admin accesstoken
                xxxxx: user.role.toLowerCase() === 'admin' ? admintoken : '',
            })
        }
        catch (err) {
            if (err.message == 'invalid signature' || err.message == 'invalid token' || err.message === 'jwt malformed' || err.message === "jwt expired") {
                return res.status(402).json({ status: false, msg: "You are not authorized! Please login or register" })
            }
            return res.status(500).json({ status: false, msg: err.message });
        }
    },

    resetPassword: async (req, res) => {
        try {

            const userId = req.user;

            const data = {
                currentPassword: DOMPurify.sanitize(req.body.currentPassword),
                newPassword: DOMPurify.sanitize(req.body.newPassword),
                cPassword: DOMPurify.sanitize(req.body.cPassword)
            }

            if (!data.newPassword || !data.cPassword || !data.currentPassword) {
                return res.status(400).json({ status: false, msg: "All fields are required" });
            }

            //use the id to find the user
            const user = await User.findOne({ _id: userId })

            if (!user) {
                return res.status(400).json({ status: false, msg: "User not found" });
            }

            // match provided password with the one in database
            const match = await bcrypt.compare(data.currentPassword.toString(), user.password)

            if (!match) {
                return res.status(400).json({ status: false, msg: "Current password is invalid" });
            }

            else if (data.newPassword.length < 6) {
                return res.status(405).json({ status: false, msg: "Password too short, must not be less than 6 characters" });
            }

            if (data.newPassword != data.cPassword) {
                return res.status(405).json({ status: false, msg: "Passwords do not match!" });
            }

            const hashedPass = await bcrypt.hash(data.newPassword, 10);
            await User.findOneAndUpdate({ _id: userId }, {
                $set: {
                    password: hashedPass
                }
            });

            return res.status(200).json({ status: true, msg: "Password changed successfully" })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ status: false, msg: "The field is required!" });
            }

            // get the user
            const user = await User.findOne({ $or: [{ email }, { username: email }] });

            if (!user) {
                return res.status(400).json({ status: false, msg: "User not found! Please register" });
            }

            // check passwordReset collection if user already exist, then update the token
            const oldUser = await PasswordReset.findOne({ userId: user._id })

            if (oldUser) {
                const passwordReset = await PasswordReset.findOneAndUpdate({ userId: user._id }, { $set: { token: ran.resetToken() } }, { new: true });
                const data = { email: user.email, passwordReset }

                passResetLink(data, res);
            }

            else {
                // otherwise generate and save token and also save the user             
                const passwordReset = new PasswordReset({
                    token: ran.resetToken(),
                    userId: user._id
                })

                // await passwordReset.save()
                const data = { email: user.email, passwordReset }

                passResetLink(data, res);
            }

        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err });
        }
    },

    verifyForgotPassword: async (req, res) => {
        try {
            const { token } = req.query;


            const data = {
                password: DOMPurify.sanitize(req.body.password),
                cPassword: DOMPurify.sanitize(req.body.cPassword)
            }

            if (!data.password || !data.cPassword) {
                return res.status(400).json({ status: false, msg: "Fill all required fields!" });

            }
            if (data.password != data.cPassword) {
                return res.status(405).json({ status: false, msg: "Passwords do not match!" });

            }

            else if (data.password.length < 6) {
                return res.status(405).json({ status: false, msg: "Password too short, must not be less than 6 characters" });
            }

            if (!token) {
                return res.status(400).json({ status: false, msg: "Token is missing!" })
            }

            //search token in the database 
            const token_ = await PasswordReset.findOne({ token });

            if (!token_) {
                return res.status(400).json({ status: false, msg: "Invalid token" })
            }


            //use the token to find the user
            const user = await User.findOne({ _id: token_.userId })

            if (!user) {
                return res.status(400).json({ status: false, msg: "User not found" });
            }

            // 1. remove the token from PasswordReset model
            await PasswordReset.findOneAndUpdate({ token }, { $set: { token: null } })

            // 2. update user model with password
            const hashedPass = await bcrypt.hash(data.password, 10);

            await User.findOneAndUpdate({ _id: user.id }, { $set: { password: hashedPass } });

            // check if user verified his/her account
            if (!user.isVerified) {
                return res.status(200).json({ status: false, msg: "Password Changed. Please verify your account to login in" });
            }

            // log the user in
            const accesstoken = generateAccesstoken(user._id);
            const refreshtoken = generateRefreshtoken(user._id);
            const admintoken = generateAdmintoken(user._id);

            return res.status(200).json({
                status: true,
                msg: "Password Changed and you are logged in",
                accesstoken,
                refreshtoken,
                admintoken: user.role.toLowerCase() === 'admin' ? admintoken : '',
            })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message });
        }
    },

    toggleBlockUser: async (req, res) => {
        try {
            let { id } = req.params
            // Find and block user, user most not be the admin
            const user_ = await User.findOne({ _id: id })
            if (!user_) {
                return res.status(404).json({ status: false, msg: "User not found" })
            }
            if (!user_.isBlocked) {
                if (user_.role?.toLowerCase() === 'admin') {
                    return res.status(400).json({ status: false, msg: "Admin's account cannot be blocked" })

                } else {
                    const data = await User.findOneAndUpdate({ _id: id }, { $set: { isBlocked: true } }, { new: true });

                    return res.status(200).json({ status: true, msg: "User's account has been blocked", data })
                }
            }

            else {
                const data = await User.findOneAndUpdate({ _id: id }, { $set: { isBlocked: false } }, { new: true });

                return res.status(200).json({ status: true, msg: "User's account has been unblocked", data });

            }

        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer support" })
        }

    },

    deleteManyAccounts: async (req, res) => {
        try {
            // find these users that are not admin
            await User.deleteMany({ $and: [{ _id: req.body.id }, { role: 'USER' }] })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer service" })
        }

    },

    deleteAccount: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findOne({ _id: id });

            if (!user) {
                return res.status(404).json({ status: false, msg: "User not found" })
            }
            else if (user.role.toLowerCase() === 'agent') {
                return res.status(404).json({ status: false, msg: "Agent cannot be deleted" })
            }
            else if (user.role.toLowerCase() === 'admin') {
                return res.status(404).json({ status: false, msg: "Admin cannot be deleted" })
            }
            else {
                // find these users that are not admin
                await User.findOneAndDelete({ _id: id })
                return res.status(200).json({ status: false, msg: "Account deleted" })
            }
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer service" })
        }

    },

    deleteAllAccounts: async (req, res) => {
        try {
            // find all users that are not admin
            await User.deleteMany({ role: 'USER' })
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message || "Server error, please contact customer service" })
        }
    },

    updateUsername: async (req, res) => {
        try {

            const userId = req.user;
            const data = {
                username: DOMPurify.sanitize(req.body.username)
            }

            const { username } = data;

            if (username && username.length < 4) {
                return res.status(400).json({ status: false, msg: "Username too short" });
            }

            // verify the code
            const user = await User.findOne({ _id: userId });

            if (!user) {
                return res.status(403).json({ status: false, msg: "User not found!" });
            }

            // check if it another user is using the username
            if (username === user.username) {
                await User.findOneAndUpdate({ _id: userId }, {
                    $set: {
                        username
                    }
                });
                return res.status(200).json({ status: true, msg: "Username updated successfully" });
            }
            else {
                const user = await User.findOne({ username });
                if (user) {
                    return res.status(403).json({ status: false, msg: "Username already taken" });
                }

                await User.findOneAndUpdate({ _id: userId }, {
                    $set: {
                        username
                    }
                });
                return res.status(200).json({ status: true, msg: "Username updated successfully" });
            }
        }
        catch (err) {
            return res.status(500).json({ status: false, msg: err.message });
        }
    },
}
