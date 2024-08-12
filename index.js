const express = require('express')
const mongoose = require('mongoose')
const authRoute = require('./routes/auth')
const movieRoute = require('./routes/movie')
const theatreRoute = require('./routes/theatre')
const movieScheduleRoute = require('./routes/movieSchedule')
const Booking = require('./models/booking')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const cors = require('cors')

const app = express()
const PORT = process.env.PORT

const { authenticationMiddleware } = require('./middlewares/authentication')

if(!PORT) throw new Error('PORT is not defined')

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected...'))

app.post('/api/v1/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    // console.log('Webhook came from Stripe')
    const sig = req.headers['stripe-signature']; //Signature sent by the stripe
    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_0fc20d1b55e5c646ea33fa814632cd8ce08b4aa10031eb4425593d89dfe57e69');
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // console.log('Event', event)

    switch (event.type) {
        case 'checkout.session.completed' : {
            const txnId = event.data.object.id
            const currency = event.data.object.currency
            const email = event.data.object.customer_email
            const metadata = event.data.object.metadata

            const { userId, scheduleId } = metadata

            const newBooking = await Booking.create({
                scheduleId,
                userId,
                transactionId: txnId
            })
        }
    }

    return res.json({ status: 'success', message: 'Booking created'})

})

//Middlewares
app.use(express.json())
app.use(cors())
app.use(authenticationMiddleware())

app.get('/', (req, res) => res.json({message: 'Server started..'}))

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/movie', movieRoute)
app.use('/api/v1/theatre', theatreRoute)
app.use('/api/v1/movieSchedule', movieScheduleRoute)



app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))