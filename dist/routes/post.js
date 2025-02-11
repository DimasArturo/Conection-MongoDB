"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacion_1 = require("../middlewares/autenticacion");
const post_model_1 = require("../models/post.model");
const file_system_1 = __importDefault(require("../classes/file-system"));
const postRoutes = (0, express_1.Router)(); //Definir la ruta
const fileSystem = new file_system_1.default(); //Instanciar la clase FileSystem
//Obtener POST paginados
postRoutes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = Number(req.query.pagina) || 1; //Si no viene la pagina, por defecto sera 1
    let skip = pagina - 1; //Si la pagina es 1, no se salta ningun registro, si es 2, se salta 10 registros
    skip = skip * 10; //Si la pagina es 1, no se salta ningun registro, si es 2, se salta 10 registros
    const posts = yield post_model_1.Post.find()
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
}));
//Crear post
postRoutes.post("/", [autenticacion_1.verificaToken], (req, res) => {
    const body = req.body;
    body.usuario = req.usuario._id;
    const imagenes = fileSystem.imagenesDeTempHaciaPost(req.usuario._id);
    body.imgs = imagenes;
    post_model_1.Post.create(body)
        .then((postDB) => __awaiter(void 0, void 0, void 0, function* () {
        yield postDB.populate("usuario", "-password");
        res.json({
            ok: true,
            post: postDB,
        });
    }))
        .catch((err) => {
        res.json(err);
    });
});
//Servicio para subir archivos
postRoutes.post("/upload", [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No se subió ningún archivo",
        });
    }
    const file = req.files.image;
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
    yield fileSystem.guardarImagenTemporal(file, req.usuario._id); //Guardar imagen en el servidor
    res.json({
        ok: true,
        file: file.mimetype,
        mensaje: "Archivo recibido correctamente",
    });
}));
postRoutes.get("/imagen/:userid/:img", (req, res) => {
    const userId = req.params.userid;
    const img = req.params.img;
    const pathFoto = fileSystem.getFotoUrl(userId, img);
    res.sendFile(pathFoto);
}); //Obtener imagen
exports.default = postRoutes;
