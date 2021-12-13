const nodemailer = require('nodemailer')

const sendEmail = async options => {
    //creating transporter for sending mails
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    //specifying options

    const mailoptions = {
        from: 'Rayyan Nauman <normaluser@hotmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    //actually sending email to client

    await transporter.sendMail(mailoptions)
}

module.exports = sendEmail