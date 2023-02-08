const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
const userController = require(`../controller/user_controller`)
const auth = require(`../auth/auth`)

app.post("/login", userController.login)
app.get("/getAllUser", auth.authVerify,userController.getAllUser)
app.post("/add", auth.authVerify,userController.addUser)
app.post("/find", auth.authVerify,userController.findUser)
app.put("/:id", auth.authVerify,userController.updateUser)
app.delete("/:id", auth.authVerify,userController.deleteUser)

module.exports = app