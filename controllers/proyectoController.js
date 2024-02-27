import Proyecto from '../models/Proyecto.js'
import Usuario from '../models/Usuario.js'

const obtenerProyectos = async (req, res) => 
{
  const proyectos = await Proyecto.find({
    '$or' : [
      {'colaboradores' : {$in: req.usuario}},
      {'creador' : {$in: req.usuario}},
    ]
  })
    .select('-tareas')
  res.json(proyectos)
}

const nuevoProyecto = async (req, res) => 
{
  const proyecto = new Proyecto(req.body)
  proyecto.creador = req.usuario._id
  
  try 
  {
    const proyectoAlmacenado = await proyecto.save()
    res.json(proyectoAlmacenado)
  } catch (error) 
  {
    console.log(error);
  }
}

const obtenerProyecto = async (req, res) => 
{
  const { id } = req.params
  const proyecto = await Proyecto.findById(id)
    .populate({path: 'tareas', populate: {path: 'completado', select: 'nombre' }})
    .populate('colaboradores', 'nombre email')

  if(!proyecto)
  {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({msg: error.message})
  }

  if(proyecto.creador.toString()!== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString()))
  {
    const error = new Error('No tienes permiso para acceder a este proyecto')
    return res.status(404).json({msg: error.message})
  }

  //obtener tareas del proyecto

  //const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)
  res.json
  (
    //{
      proyecto
      //tareas
    //}
  )
}

const editarProyecto = async (req, res) => 
{
  const { id } = req.params
  const proyecto = await Proyecto.findById(id)
  
  if(!proyecto)
  {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({msg: error.message})
  }

  if(proyecto.creador.toString()!== req.usuario._id.toString())
  {
    const error = new Error('No tienes permiso para acceder a este proyecto')
    return res.status(404).json({msg: error.message})
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
  proyecto.cliente = req.body.cliente || proyecto.cliente
  
  try 
  {
    const proyectoAlmacenado = await proyecto.save()  
    res.json(proyectoAlmacenado)
  } catch (error) 
  {
    console.log(error);
  }

}

const eliminarProyecto = async (req, res) => 
{
  const { id } = req.params
  const proyecto = await Proyecto.findById(id)
  
  if(!proyecto)
  {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({msg: error.message})
  }

  if(proyecto.creador.toString()!== req.usuario._id.toString())
  {
    const error = new Error('No tienes permiso para acceder a este proyecto')
    return res.status(404).json({msg: error.message})
  }

  try 
  {
    await proyecto.deleteOne()
    res.json({msg: 'Proyecto Eliminado'})
  } catch (error) 
  {
    console.log(error);
  }

}

const buscarColaborador = async (req, res) => {
  const { email } = req.body

  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v ')

  if(!usuario) {
    const error = new Error('Usuario no registrado')
    return res.status(404).json({msg: error.message})
  }

  res.json(usuario)

}

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id)

  if(!proyecto){
    const error = new Error('El proyecto no existe')
    return res.status(404).json({msg: error.message})
  }

  if(proyecto.creador.toString() !== req.usuario._id.toString()){
    const error = new Error('No tienes permisos para proceder')
    return res.status(404).json({msg: error.message})
  }

  const { email } = req.body
  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v ')

  if(!usuario) {
    const error = new Error('Usuario no registrado')
    return res.status(404).json({msg: error.message})
  }

  //El admin no se agrega como colaborador
  if(proyecto.creador.toString() === usuario._id.toString()){
    const error = new Error('El administrador del proyecto no puede ser colaborador')
    return res.status(404).json({msg: error.message})
  }

  //Revisar que no esté ya agregado
  if(proyecto.colaboradores.includes(usuario._id)){
    const error = new Error('El usuario ya es colaborador')
    return res.status(404).json({msg: error.message})
  }

  //Pasaron las validaciones
  proyecto.colaboradores.push(usuario._id)
  await proyecto.save()
  res.json({msg: 'Colaborador agregado con éxito  '})

}

const eliminarColaborador = async (req, res) => {

  const proyecto = await Proyecto.findById(req.params.id)

  if(!proyecto){
    const error = new Error('El proyecto no existe')
    return res.status(404).json({msg: error.message})
  }

  if(proyecto.creador.toString() !== req.usuario._id.toString()){
    const error = new Error('No tienes permisos para proceder')
    return res.status(404).json({msg: error.message})
  }

  //Pasaron las validaciones, procede a Eliminar
  proyecto.colaboradores.pull(req.body.id)
  await proyecto.save()
  res.json({msg: 'Colaborador agregado con éxito  '})

}

export 
{
  obtenerProyectos, nuevoProyecto, obtenerProyecto, editarProyecto, eliminarProyecto, buscarColaborador, agregarColaborador, eliminarColaborador
}