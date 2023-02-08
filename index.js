const express = require(`express`)
const bodyParser = require('body-parser')
const app = express()
const PORT = 8000
const cors = require(`cors`)
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//user
const userRoute = require(`./routes/user.routes`)
app.use(`/user`, userRoute)

//tipekamar 
const tipekamarRoute = require(`./routes/tipekamar.routes`)
app.use(`/tipekamar`, tipekamarRoute)


//kamar
const kamarRoute = require(`./routes/kamar.routes`)
app.use(`/kamar`, kamarRoute)

//pemesanan
const pemesananRoute = require(`./routes/pemesanan.routes`)
app.use(`/pemesanan`, pemesananRoute)

app.listen(PORT, () => {
    console.log(`Server of Wikusama Hotel runs on port
${PORT}`)
})