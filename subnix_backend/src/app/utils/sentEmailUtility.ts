import nodemailer from "nodemailer";
import config from "../../config";

// const sentEmailUtility = async (
//   emailTo: string,
//   EmailSubject: string,
//   EmailText: string,
//   EmailHTML: string
// ) => {
//   // Create a transporter
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     port: 587,
//     secure: false,
//     auth: {
//       user: config.emailSender.email,
//       pass: config.emailSender.app_pass,
//     },
//   });

//   // Email options
//   const mailOptions = {
//     from: config.emailSender.email,
//     to: emailTo,
//     subject: EmailSubject,
//     html: EmailHTML,
//     text: EmailText,
//   };
//   await transporter.sendMail(mailOptions);
// };

const sentEmailUtility = async (

  emailTo: string,
  EmailSubject: string,
  EmailText: string,
  EmailHTML: string
 
) => {
  // Create a transporter
  //development phase mail send
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  // hostinger transporter
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.hostinger.com",
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: config.emailSender.email,
  //     pass: config.emailSender.app_pass,
  //   },
  // });

  // Email options
  const mailOptions = {
    // from: Aira - Rental Service: <${config.emailSender.email}>,
    from: `"Flowlign" <${config.emailSender.email}>`,
    to: emailTo,
    subject: EmailSubject,
    html: EmailHTML,
    text: EmailText,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("info", info);
    // console.log("Email sent");
  } catch (error) {
    console.error("SMTP ERROR:", error);
    throw error;
  }
};
 

export default sentEmailUtility;


