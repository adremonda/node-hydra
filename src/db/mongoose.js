const mongoose = require('mongoose')
console.log(process.env.MONGODB_URL)
const mongo_url = process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo'
mongoose.connect(mongo_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})