import express from 'express'
import { registrar, autenticar, confirmar, recuperar, comprobarToken, nuevoPassword, perfil } from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

//CRUD de usuarios
router.post
(
  '/', registrar
) //Crear un nuevo usuario

router.post
(
  '/login', autenticar
) //Acceso a usuarios registrados

router.get
(
  '/confirmar/:token', confirmar
) //Confirmar cuenta de correo

router.post
(
  '/recuperar', recuperar
) //Recuperar contraseña

router.route
(
  '/recuperar/:token'
).get(comprobarToken).post(nuevoPassword)

router.get 
(
  '/perfil', checkAuth, perfil
)

export default router