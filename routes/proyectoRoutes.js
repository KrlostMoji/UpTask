import express from 'express'
import 
{
  obtenerProyectos, nuevoProyecto, obtenerProyecto, editarProyecto, eliminarProyecto, buscarColaborador, agregarColaborador, eliminarColaborador
} from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'

const routerProyectos = express.Router()

routerProyectos
  .route('/')
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto)

routerProyectos
  .route('/:id')
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto)

routerProyectos.post('/colaboradores', checkAuth, buscarColaborador)
routerProyectos.post('/colaboradores/:id', checkAuth, agregarColaborador)
routerProyectos.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador)

export default routerProyectos