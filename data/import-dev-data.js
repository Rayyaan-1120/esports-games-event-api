const dotenv = require('dotenv')
const fs = require('fs')
const mongoose = require('mongoose')
const Game = require('../models/gamemodel')


dotenv.config({ path: './config.env' })

//connecting mongodb with mongoose
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
}).then(con => {
    console.log("connection successful")
}).catch(err => {
    console.log(err)
})

// Reading json file

const games = JSON.parse(fs.readFileSync(`${__dirname}/displaydata.json`,'utf-8'));

//IMPORT DATA INTO DATABASE

const importdata = async () => {
    try{
     await Game.create(games)
     console.log('data successfully loaded')
     process.exit()
    }catch(err){
        console.log(err)
    }
}

//delete all data from collection from database 

const Deletedata = async () => {
    try{
        await Game.deleteMany()
        console.log('data has been deleted successfully')
     process.exit()

    }catch(err){
        console.log(err)
    }
}

if(process.argv[2] === '--import'){
    importdata()
}else if(process.argv[2] === '--delete'){
    Deletedata()
}

console.log(process.argv)
