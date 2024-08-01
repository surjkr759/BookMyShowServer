const express = require('express')
const mongoose = require('mongoose')
const authRoute = require('./routes/auth')
const movieRoute = require('./routes/movie')
const theatreRoute = require('./routes/theatre')
const movieSCheduleRoute = require('./routes/movieSchedule')

const cors = require('cors')

const app = express()
const PORT = process.env.PORT

const { authenticationMiddleware } = require('./middlewares/authentication')

if(!PORT) throw new Error('PORT is not defined')

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected...'))

//Middlewares
app.use(express.json())
app.use(cors())
app.use(authenticationMiddleware())

app.get('/', (req, res) => res.json({message: 'Server started..'}))

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/movie', movieRoute)
app.use('/api/v1/theatre', theatreRoute)
app.use('/api/v1/movieSchedule', movieSCheduleRoute)

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))