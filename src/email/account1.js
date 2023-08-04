require('dotenv').config();
const sgMail= require('@sendgrid/mail')
const sendgridApiKey= process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridApiKey)


sendConformationEmail= (Email,name,firstName,lastName)=>{
    sgMail.send({
        to: Email,
        from: 'singhabhi30020@gmail.com',
        subject: 'Donation Request Accepted',
        text: `Hi ${name}. ${firstName} ${lastName} has accepted your blood donation request.`
    })
    console.log(Email)

}

module.exports= {
    sendConformationEmail
}



