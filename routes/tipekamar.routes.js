const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
const tipekamarController = require(`../controller/tipekamar_controller`)
app.get("/get", tipekamarController.getAllTipe)
app.post("/add", tipekamarController.addTipe)
app.post("/find", tipekamarController.findTipe)
app.put("/:id", tipekamarController.updateTipe)
app.delete("/:id", tipekamarController.deleteTipe)

module.exports = app