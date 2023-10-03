import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true //to remove whitespace
        },
        email: {
            type: String,
            required: true,
            unique: true //one person can use only one email id
        },
        password: {
            type: String,
            required: true,
        },
        address: {

            type: String,
            required: true,
        },
        role: {

            type: Number,
            default: 0
        },
        token: {
            type: String,
            default: ''
        }
    }, { timestamps: true }) //whenever a new user is created its timestamp get added
export default mongoose.model('users', userSchema)