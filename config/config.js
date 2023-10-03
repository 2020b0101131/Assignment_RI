import dotenv from "dotenv";
const config = {

    secret_jwt: process.env.SECRET_JWT,
    emailUser: process.env.EMAILUSER,
    emailPassword: process.env.EMAILPASSWORD,
}
export default config;