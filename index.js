import  express  from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectDB from './config/db.js';
import router from './routes/usuarioRoutes.js';
import routerProyectos from './routes/proyectoRoutes.js';
import routerTareas from './routes/tareaRoutes.js';

const app = express()
app.use
(
  express.json()
)

dotenv.config()

conectDB()

//Configurar CORS
const whitelist = [process.env.FRONTEND_URL]

const corsOptions = 
{
  origin: function(origin, callback)
  {
    if(whitelist.includes(origin))
    {
      //Procede a consultar la API
      callback(null, true)
    } 
    else
    {
      //No se permite el request
      callback(new Error('Error Cors'))
      
    }
  }
}

app.use(cors({origin: '*'}))

//Routing
app.use
(
  '/api/usuarios', router
)

app.use
(
  '/api/proyectos', routerProyectos
)

app.use
(
  '/api/tareas', routerTareas
)

const PORT = process.env.PORT

const servidor = app.listen
  (PORT, () =>
    {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
    }
  )

  //Socket io
import { Server } from 'socket.io';

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
  }
})

io.on('connection', (socket) => {
  console.log('Conectado a Socket.IO');
  //Definir los eventos
  socket.on('Abrir proyecto', (proyecto) =>{
    socket.join(proyecto) 
  })

  socket.on('nueva tarea', tarea => {
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea agregada', tarea)
  })

  socket.on('eliminar tarea', tarea =>{
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea eliminada', tarea)
  })

  socket.on('actualizar tarea', tarea => {
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('tarea actualizada', tarea)
  })

  socket.on('cambiar estado', tarea => {
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('estado cambiado', tarea)
  })

})
