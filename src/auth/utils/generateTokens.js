const jwt = require('jsonwebtoken');
require('dotenv').config()

function generateAccesstoken(id) {

    return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_DURATION })
}

function generateRefreshtoken(id) {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_DURATION })
}

function generateAdmintoken(id) {
    return jwt.sign({ id }, process.env.JWT_ADMIN_SECRET, { expiresIn: process.env.JWT_ADMIN_DURATION })
}

function generateSupperAdmintoken(id) {
    return jwt.sign({ id }, process.env.JWT_SUPPER_ADMIN_SECRET, { expiresIn: process.env.JWT_SUPPER_ADMIN_DURATION })
}

function generateAgenttoken(id) {
    return jwt.sign({ id }, process.env.JWT_AGENT_SECRET, { expiresIn: process.env.JWT_AGENT_DURATION })
}


module.exports = { generateAccesstoken, generateRefreshtoken, generateSupperAdmintoken, generateAdmintoken, generateAgenttoken }
