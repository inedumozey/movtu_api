const express = require("express")
const authCrtl = require('../controls/auth')
const { activatedUserAuth, adminAuth } = require("../middlewares/auth")

const route = express.Router()

// route.get("/authorize", authCrtl.authorize);
route.get("/fetch-profile", activatedUserAuth, authCrtl.fetchProfile);

route.get("/fetch-users", activatedUserAuth, adminAuth, authCrtl.fetchUsers);

route.get("/fetch-user/:id", activatedUserAuth, adminAuth, authCrtl.fetchUser);

route.post("/get-code", authCrtl.getCode);

route.post("/signup", authCrtl.signup);

route.post("/signin", authCrtl.signin);

route.get("/generate-accesstoken", authCrtl.generateAccesstoken);

route.post("/forgot-password", authCrtl.forgotPassword);

route.put("/verify-forgot-password", authCrtl.verifyForgotPassword);

route.put('/reset-password', activatedUserAuth, authCrtl.resetPassword);

route.put("/update-username", activatedUserAuth, authCrtl.updateUsername);

// route.get("/toggle-admin/:id", activatedUserAuth, adminAuth, authCrtl.toggleAdmin);

// route.get("/toggle-agent/:id", activatedUserAuth, adminAuth, authCrtl.toggleAgent);

// route.delete("/delete-account/:id", authCrtl.deleteAccount);




module.exports = route