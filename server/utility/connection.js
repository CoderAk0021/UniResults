import dotenv from 'dotenv';
import mongoose from 'mongoose'

dotenv.config();

const mongoURL = process.env.MONGO_URI

async function connectDB(url) {
    try{
        await mongoose.connect(url);
        console.log('MongoDB Connected !')
    }
    catch(error) {
        console.log(error.message);
        process.exit(1);
    }
}

connectDB(mongoURL);
