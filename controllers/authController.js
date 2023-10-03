import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import config from "../config/config.js";

const sendResetPasswordMail = async(name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p> Hi ' + name + ',please copy the link and <a href = "http://localhost:8080/api/v1/auth/reset-password?token=' + token + ' " >reset your password</a> < /p>'
        }
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("mail has been send:-", info.response);
            }
        })
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
}
export const registerController = async(req, res) => {
    try {
        const { name, email, password, phone, address } = req.body; //destructure
        //validation
        if (!name) {
            return res.send({ message: "Name is Required" });
        }
        if (!email) {
            return res.send({ message: "Email is Required" });
        }
        if (!password) {
            return res.send({ message: "Password is Required" });
        }
        if (!phone) {
            return res.send({ message: "Phone number is Required" });
        }
        if (!address) {
            return res.send({ message: "Address is Required" });
        }
        //check user
        const existingUser = await userModel.findOne({ email });
        //existing user
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'Already Register please login',
            })

        }
        //register user
        const hashedPassword = await hashPassword(password);
        //save
        const user = await new userModel({ name, email, phone, address, password: hashedPassword }).save()
        res.status(201).send({
            success: true,
            message: 'User Register Successfully',
            user,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Registration',
            error
        })
    }

};
//POST login
export const loginController = async(req, res) => {
    try {
        const { email, password } = req.body
            //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: 'Invalid email or password'
            })
        }
        //check user email is registered or not
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Email is not registered'
            })
        }
        //check login password is matching or not, with registered password
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Invalid Password'
            })
        }
        //token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(200).send({
            success: true,
            message: 'Login Successfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
            },
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Login',
            error
        })
    }
}
export const testController = (req, res) => {
    try {
        res.send("Protected Routes");
    } catch (error) {
        console.log(error);
        res.send({ error });
    }
}
export const forget_password = async(req, res) => {
    try {
        const email = req.body.email;
        // const email = "k.saranshchauhan@gmail.com";
        const userData = await userModel.findOne({ email: email })
        if (userData) {
            const randomString = randomstring.generate();
            const data = await userModel.updateOne({ email: email }, { $set: { token: randomString } });
            sendResetPasswordMail(userData.name, userData.email, randomString);
            res.status(200).send({ success: true, msg: "Kindly check your mail to reset password" })
        } else {
            res.status(200).send({ success: true, msg: "This mail does not exist" })
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
}
export const reset_password = async(req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await userModel.findOne({ token: token });
        if (tokenData) {
            const newPassword = req.body.password;
            // const newPassword = await hashPassword(password);
            const userData = await userModel.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newPassword, token: '' } }, {})
            res.status(200).send({ success: true, msg: "User password has been reset", data: userData });
        } else {
            res.status(200).send({ success: true, msg: "Link has expired token" })
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }

}
export const editUser = async(request, response) => {
        let user = request.body;
        const editUser = new userModel(user);
        try {

            await userModel.updateOne({ _id: request.params.id }, editUser);
            response.status(201).json(editUser);
        } catch (error) {
            response.status(409).json({ message: error.message });
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////e
export const deleteUser = async(request, response) => {
    try {
        await userModel.deleteOne({ _id: request.params.id });
        response.status(200).json({ message: "User Deleted Successfully" });
    } catch (error) {
        response.status(409).json({ message: error.message });
    }
}