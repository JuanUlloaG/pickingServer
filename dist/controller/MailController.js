"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.createMailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
let testAccount = null;
let transporter;
async function createMailer() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    testAccount = await nodemailer_1.default.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer_1.default.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
            user: "juan.ulloa@srconsultoresspa.onmicrosoft.com",
            pass: "Ckfkwg93",
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });
}
exports.createMailer = createMailer;
async function sendEmail(mail) {
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Carlos 👻" <juan.ulloa@sr-consultores.com>',
        to: "julloa.info@gmail.com",
        subject: "Hello ✔",
        text: "Hello world?",
        html: "<b>Hello world?</b>",
    });
}
exports.sendEmail = sendEmail;
