import Server from "./classes/server";
import userRoutes from './routes/usuario';
import mongoose from "mongoose";
import bodyParser from "body-parser";


const server = new Server();

//BodyParser
server.app.use(bodyParser.urlencoded({extended: true}))
server.app.use(bodyParser.json())


//Rutas de la app
server.app.use('/user', userRoutes)

//conectar BD
// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/fotosgram')
  .then(() => {
    console.log('Base de datos conectada exitosamente');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
  });

  


//Levantar express
server.start(() =>{
    console.log(`Servidor corriendo en puerto ${server.port}`)
});