const express = require('express')
require('./db/mongoose.js')
const User = require('./models/user')
const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (error) {
        res.status(500).send()
    }
})

app.get('/users/:id', async (req, res) => {
    const _id =req.params.id
    try {
        const user = await User.findById(_id)
        if(!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch (error) {
        res.status(500).send()
    }
})

app.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if(!user) {
            res.status(404).send()
        }
        console.log(user)
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
        
    }
})

app.listen(port, () => {
    console.log("The server is up on port " + port)
})