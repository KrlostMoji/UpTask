import Usuario from '../models/Usuario.js'
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'
import { emailRegistro, emailRecovery } from '../helpers/email.js'


const registrar = async (req, res) =>
{
  //Evitar registro duplicado
  const { email } = req.body
  const existeUsuario = await Usuario.findOne({ email })
  if(existeUsuario)
  {
    const error = new Error('El correo está asociado a otra cuenta')
    return res.status(400).json({msg: error.message})
  }

  try {
    const usuario = new Usuario(req.body)
    usuario.token = generarId()
    await usuario.save()

        //Enviar email
        emailRegistro({
          email: usuario.email,
          nombre: usuario.nombre,
          token: usuario.token
        })

    res.json({msg: 'Usuario Creado Con Éxito. Confirma tu cuenta mediante tu correo electrónico'})
  } catch (error) {
    console.log(error);
  }
}

const autenticar = async (req, res) =>
{
  const { email, password } = req.body
  //El usuario existe?
  const usuario = await Usuario.findOne({ email })
  if(!usuario)
  {
    const error = new Error('El usuario no existe')
    return res.status(404).json({msg: error.message})
  }
  //Correo confirmado?
  if(!usuario.confirmado)
  {
    const error = new Error('El correo no ha sido confirmado')
    return res.status(403).json({msg: error.message})
  }
  //Password correcto?
  if(await usuario.comprobarPassword(password))
  {
   res.json
   (
    {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id)
    }
   )
  } else 
  {
    const error = new Error('Contraseña incorrecta')
    return res.status(403).json({msg: error.message})
  }
}

const confirmar = async (req, res) =>
{
  const { token } = req.params
  const usuarioConfirmar = await Usuario.findOne({ token })
  
  if(!usuarioConfirmar)
  {
    const error = new Error('Tokén no válido')
    return res.status(403).json({msg: error.message})
  }

  try 
  {
    usuarioConfirmar.confirmado = true
    usuarioConfirmar.token = ''
    await usuarioConfirmar.save()

    res.json({msg: 'Usuario confirmado correctamente'})
  }catch (error) 
  {  
    console.log(error);
  }

}

const recuperar = async(req, res) => 
{
  const { email } = req.body

  const usuario = await Usuario.findOne({ email })
  if(!usuario)
  {
    const error = new Error('El usuario no existe')
    return res.status(404).json({msg: error.message})
  }

  try 
  {
    //Generar nuevo token
    usuario.token = generarId() 
    await usuario.save()
    //Enviar el email
    emailRecovery({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    })
    res.json({msg: 'Se han enviado las instrucciones a tu correo para recuperar tu cuenta'})
  } catch (error) 
  {
    console.log(error);
  }

}

const comprobarToken = async(req, res) => 
{
  const { token } = req.params
  const tokenValido = await Usuario.findOne({ token })

  if(tokenValido)
  {
    res.json({msg: 'Tokén válido'})
  } else 
  {
    const error = new Error('Tokén no válido')
    return res.status(404).json({msg: error.message})
  }

}

const nuevoPassword = async(req, res) => 
{
  const { token } = req.params
  const { password } = req.body

  const usuario = await Usuario.findOne({ token })

  if(usuario)
  {
    usuario.password = password
    usuario.token = ''
    try 
    {
      await usuario.save()
      res.json({msg: 'Se ha modificado el password'})  
    } catch (error) 
    { 
      console.log(error);
    }
  } else 
  {
    const error = new Error ('Tokén no válido')
    return res.status(404).json({msg: error.message})
  }

}

const perfil = async (req, res) =>
{
  const { usuario } = req

  res.json(usuario)

}

export 
{
  registrar, autenticar, confirmar, recuperar, comprobarToken, nuevoPassword, perfil
}