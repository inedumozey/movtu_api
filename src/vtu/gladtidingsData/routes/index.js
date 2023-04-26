const express = require("express")
const ctrl = require('../controllers')
const { activatedUserAuth, adminAuth } = require("../../../auth/middlewares/auth")

const route = express.Router()

route.get("/data-plans", ctrl.getAllDataPlans);
route.get("/buy-data", activatedUserAuth, ctrl.buyData);

route.get("/airtime-plans", ctrl.getAllAirtimePlans);
route.get("/buy-airtime", activatedUserAuth, ctrl.buyAirtime);

// get user details from gladtidingsdata
route.get("/get-user-detial", activatedUserAuth, adminAuth, ctrl.getUserDetails);




module.exports = route