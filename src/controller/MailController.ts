import nodemailer, { Transporter } from "nodemailer";
let testAccount = null;
let transporter: Transporter


export async function createMailer() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "carlos.petit@srconsultoresspa.onmicrosoft.com", // generated ethereal user
            pass: "Cux85335", // generated ethereal password
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });


}

export async function sendEmail(mail: object) {
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Carlos 👻" <carlos.petit@sr-consultores.com>', // sender address
        to: "ca.alberto.p@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });
}

