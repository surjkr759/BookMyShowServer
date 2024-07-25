const express = require('express')
const mongoose = require('mongoose')
const authRoute = require('./routes/auth')

const app = express()
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

if(!PORT) throw new Error('PORT is not defined')

// mongoose.connect(MONGODB_URI)
// .then(() => console.log('MongoDB connected...'))
// .catch((err) => console.log('Something went wrong...', err))

app.use(express.json())

app.get('/', (req, res) => res.json({message: 'Server started..'}))

app.use('/api/v1/auth', authRoute)

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))