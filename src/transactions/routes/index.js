const express = require("express")
const ctrl = require('../controllers')
const { activatedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/transactions", activatedUserAuth, ctrl.transactions);




module.exports = route