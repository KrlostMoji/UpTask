import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"

const agregarTarea = async (req, res) => {
  const {proyecto} = req.body
  
  const existeProyecto = await Proyecto.findById(proyecto) 

  if(!existeProyecto)
  {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({msg: error.message})
  }

  if(existeProyecto.creador.toString() !== req.usuario._id.toString())
  {
    const error = new Error('Permiso denegado para añadir tareas al proyecto')
    return res.status(403).json({msg: error.message})
  }

  try 
  { 
    const tareaAlmacenada = await Tarea.create(req.body)
    //Almacenar ID de la tarea en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id)
    await existeProyecto.save()
    res.json(tareaAlmacenada)
  } catch (error) 
  {
    console.log(error);
  }


}

const obtenerTarea = async (req, res) => {
  const {id} = req.params

  const tarea = await Tarea.findById(id).populate('proyecto')

  if(!tarea)
  {
    const error = new Error('Tarea no encontrada')
    return res.status(404).json({msg: error.message})
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString())
  {
    const error = new Error('No tienes autorización para acceder a esta tarea')
    return res.status(403).json({msg: error.message})
  }

  
}

const actualizarTarea = async (req, res) => {
  const {id} = req.body

  const tarea = await Tarea.findById(id).populate('proyecto')
  console.log(tarea);
  const proyecto = await Proyecto.findById(req.body.proyecto)
  
  if(!tarea)
  {
    const error = new Error('Tarea no encontrada')
    return res.status(404).json({msg: error.message})
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString())
  {
    const error = new Error('No tienes autorización para acceder a esta tarea')
    return res.status(403).json({msg: error.message})
  }

  tarea.nombre = req.body.nombre || tarea.nombre
  tarea.descripcion = req.body.descripcion || tarea.descripcion
  tarea.prioridad = req.body.prioridad || tarea.prioridad
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

  try 
  {
    const tareaAlmacenada = await tarea.save()//replaceOne({_id: id, nombre: req.body.nombre || tarea.nombre, descripcion: req.body.descripcion || tarea.descripcion, estado: req.body.estado, fechaEntrega: req.body.fechaEntrega || tarea.fechaEntrega, prioridad: req.body.prioridad || tarea.prioridad, proyecto: req.body.proyecto})    
    res.json(tareaAlmacenada)

  } catch (error) 
  {
    console.log(error);  
  }

}

const eliminarTarea = async (req, res) => {
  const {id} = req.params

  const tarea = await Tarea.findById(id).populate('proyecto')

  if(!tarea)
  {
    const error = new Error('Tarea no encontrada')
    return res.status(404).json({msg: error.message})
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString())
  {
    const error = new Error('No tienes autorización para acceder a esta tarea')
    return res.status(403).json({msg: error.message})
  }

  try 
  {
    const proyecto = await Proyecto.findById(tarea.proyecto)
    console.log(proyecto.tareas);
    proyecto.tareas.pull(tarea._id)
      
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

    res.json({msg: 'La tarea ha sido eliminada de la base de datos'})
  } catch (error) 
  {
    console.log(error);  
  }

}

const cambiarStatus = async (req, res) => {

  const {id} = req.params
  const tarea = await Tarea.findById(id)
  
  const proyecto = await Proyecto.findById(req.body.proyecto)

  if(!tarea){
    const error = new Error ('Tarea no encontrada')
    return res.status(404).json({msg: error.message})
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString()))
  {
    const error = new Error('No tienes autorización para acceder a esta tarea')
    return res.status(403).json({msg: error.message})
  }

  tarea.estado = !tarea.estado
  tarea.completado = req.usuario._id
  await tarea.save()

  const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado')
  
  res.json(tareaAlmacenada)
}

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarStatus
}
