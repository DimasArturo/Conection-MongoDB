import Server from "./classes/server";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import userRoutes from './routes/usuario';
import postRoutes from "./routes/post";


const server = new Server();

//BodyParser
server.app.use(bodyParser.urlencoded({extended: true}));
server.app.use(bodyParser.json());

//FileUpload
server.app.use(fileUpload());

//CORS
server.app.use(cors({origin: true, credentials: true}));

//Rutas de la app
server.app.use('/user', userRoutes)
server.app.use('/posts', postRoutes)

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