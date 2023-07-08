require('dotenv').config();
const sgMail= require('@sendgrid/mail')
const sendgridApiKey= process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridApiKey)


sendConformationEmail= (Email,name,hospitalName)=>{
    sgMail.send({
        to: Email,
        from: 'singhabhi30020@gmail.com',
        subject: 'Sending Ambulance',
        text: `Hi ${name}. ${hospitalName} sending you ambulance ASAP.`
    })
    console.log(Email)

}

module.exports= {
    sendConformationEmail
}



