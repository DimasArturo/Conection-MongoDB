import { Router, Response, Request } from "express";
import { verificaToken } from "../middlewares/autenticacion";
import { Post } from "../models/post.model";
import fileUpload from "express-fileupload";
import { FileUpload } from "../interfaces/file-upload";
import FileSystem from "../classes/file-system";

const postRoutes = Router(); //Definir la ruta
const fileSystem = new FileSystem(); //Instanciar la clase FileSystem

//Obtener POST paginados
postRoutes.get("/", async (req: any, res: Response) => {
  let pagina = Number(req.query.pagina) || 1; //Si no viene la pagina, por defecto sera 1
  let skip = pagina - 1; //Si la pagina es 1, no se salta ningun registro, si es 2, se salta 10 registros
  skip = skip * 10; //Si la pagina es 1, no se salta ningun registro, si es 2, se salta 10 registros

  const posts = await Post.find()
    .sort({ _id: -1 }) //Ordenar de forma descendente
    .skip(skip) //Saltar registros
    .limit(10) //Mostrar solo 10 registros
    .populate("usuario", "-password") //Mostrar todos los campos menos el password
    .exec();

  res.json({
    ok: true,
    pagina,
    posts,
  });
});

//Crear post
postRoutes.post("/", [verificaToken], (req: any, res: Response) => {
  const body = req.body;
  body.usuario = req.usuario._id;

  const imagenes = fileSystem.imagenesDeTempHaciaPost(req.usuario._id);
  body.imgs = imagenes;

  Post.create(body)
    .then(async (postDB) => {
      await postDB.populate("usuario", "-password");

      res.json({
        ok: true,
        post: postDB,
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

//Servicio para subir archivos
postRoutes.post("/upload", [verificaToken], async (req: any, res: any) => {
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se subió ningún archivo",
    });
  }

  const file: FileUpload = req.files.image;

  if (!file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se subió ningún archivo - image",
    });
  }

  if (!file.mimetype.includes("image")) {
    return res.status(400).json({
      ok: false,
      mensaje: "Lo que subió no es una imagen",
    });
  }

  await fileSystem.guardarImagenTemporal(file, req.usuario._id); //Guardar imagen en el servidor

  res.json({
    ok: true,
    file: file.mimetype,
    mensaje: "Archivo recibido correctamente",
  });
});


postRoutes.get("/imagen/:userid/:img", (req: any, res: Response) => {
  const userId = req.params.userid;
  const img = req.params.img;
  const pathFoto = fileSystem.getFotoUrl(userId, img);

  res.sendFile(pathFoto);
}); //Obtener imagen

export default postRoutes;
