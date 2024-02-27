import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos

  //Configuración nodemailer
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  //Información del email

  const info = await transport.sendMail({
    from: 'Up Task - Administrador <admor@uptask.com>',
    to: email,
    subject: 'Up Task - Confirma tu cuenta',
    text: 'Comfirma tu cuenta en Up Task',
    html: `<p>Hola: ${nombre} Confirma tu cuenta</p>
    <p>Da clic en el siguiente enlace para confirmar tu usuario:</p>
    <a href='${process.env.FRONTEND_URL}/confirmar/${token}'>Confirmar cuenta</a>
    <p>Si no fuiste tú, puedes ignorar este email</p>`
  })

}

const emailRecovery = async (datos) => {
  const { email, nombre, token } = datos

  //Configuración nodemailer
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  //Información del email

  const info = await transport.sendMail({
    from: 'Up Task - Administrador <admor@uptask.com>',
    to: email,
    subject: 'Up Task - Reestablece tu password',
    text: 'Recupera tu password para tu cuenta en Up Task',
    html: `<p>Hola: ${nombre} Reestablece tu password</p>
    <p>Da clic en el siguiente enlace para confirmar tu usuario:</p>
    <a href='${process.env.FRONTEND_URL}/password/${token}'>Reestablecer password</a>
    <p>Si tú no solicitaste reestablecer tu password, puedes ignorar este email</p>`
  })

}



export {emailRegistro, emailRecovery}