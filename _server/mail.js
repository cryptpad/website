const Nodemailer = require('nodemailer');
const config = require('./config');

const Mail = {};

Mail.send = (subject, content, cb) => {

    const mailOptions = {
        from: `"CryptPad.org" <${config.mail?.user}>`,
        to: config.mail?.sendTo,
        subject: subject,
        text: content
    };
    const smtpTransport = Nodemailer.createTransport({
        host: config.mail?.host,
        port: config.mail?.port,
        tls: config.mail?.tls,
        auth: {
            user: config.mail?.user,
            pass: config.mail?.password
        }
    });
    smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return void cb(error);
        }
        console.log('Message sent: %s', info.messageId);
        cb(void 0, info);
    });

};

module.exports = Mail;
