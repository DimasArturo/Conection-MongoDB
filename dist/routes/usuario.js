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
const usuario_model_1 = require("../models/usuario.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../classes/token"));
const autenticacion_1 = require("../middlewares/autenticacion");
const userRoutes = (0, express_1.Router)();
// Login
userRoutes.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Buscar usuario en la base de datos sin callback
        const userDB = yield usuario_model_1.Usuario.findOne({ email: body.email });
        // Verificar si el usuario existe
        if (!userDB) {
            res.json({
                ok: false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
            return;
        }
        // Verificar la contraseña
        if (yield userDB.CompararPassword(body.password)) {
            const tokenUser = token_1.default.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                email: userDB.email,
                avatar: userDB.avatar
            });
            res.json({
                ok: true,
                token: tokenUser
            });
        }
        else {
            res.json({
                ok: false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
        }
    }
    catch (err) {
        res.json({
            ok: false,
            mensaje: 'Error en el servidor',
            error: err
        });
    }
}));
// Registro de usuario
userRoutes.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = {
            nombre: req.body.nombre,
            email: req.body.email,
            password: bcrypt_1.default.hashSync(req.body.password, 10),
            avatar: req.body.avatar
        };
        // Crear usuario en la base de datos
        const userDB = yield usuario_model_1.Usuario.create(user);
        const tokenUser = token_1.default.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });
        res.json({
            ok: true,
            token: tokenUser
        });
    }
    catch (err) {
        console.error('Error al crear el usuario:', err);
        res.status(500).json({
            ok: false,
            message: 'Error al crear el usuario',
            error: err
        });
    }
}));
// Actualizar usuario
userRoutes.post('/update', autenticacion_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = {
        nombre: req.body.nombre || req.usuario.nombre,
        email: req.body.email || req.usuario.email,
        avatar: req.body.avatar || req.usuario.avatar
    };
    try {
        const userDB = yield usuario_model_1.Usuario.findByIdAndUpdate(req.usuario._id, user, { new: true });
        if (!userDB) {
            res.json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID'
            });
            return;
        }
        const tokenUser = token_1.default.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });
        res.json({
            ok: true,
            token: tokenUser
        });
    }
    catch (err) {
        res.json({
            ok: false,
            mensaje: 'Error en el servidor',
            error: err
        });
    }
}));
userRoutes.get('/', [autenticacion_1.verificaToken], (req, res) => {
    const usuario = req.usuario;
    res.json({
        ok: true,
        usuario
    });
});
exports.default = userRoutes;
