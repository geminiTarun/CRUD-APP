import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, //true for 465 ,false for other ports
  auth: {
    user: process.env.EMAIL_USER, // admin email id
    pass: process.env.EMAIL_PASS, //admin email id
  },
});
export default transporter;
