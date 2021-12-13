const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })
const mongoose = require('mongoose')
const app = require('./app')

//listening to uncaught exceptions (sync code)
process.on('uncaughtException', err => {
    console.log('your app has been crashed')
    console.log(err.name)

    process.exit(1)
})



//connecting mongodb with mongoose
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
}).then(con => {
    console.log("MongoDB mongoose connection successfull")
}).catch(err => {
    console.log(err)
})


//////////////////////
//listening to server

const port = process.env.PORT || 3001
const server = app.listen(port, () => {
    console.log(`server started running at ${port}....`)
})

//listening to unhandled promise rejection (async code)
//this will handle all unhandled rejections anywhere in the app and directly shutdown tha app
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})

