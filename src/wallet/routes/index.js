const express = require("express")
const ctrl = require('../controllers')
const { activatedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/generate-account-number", activatedUserAuth, ctrl.generateAccountNumber);




module.exports = route