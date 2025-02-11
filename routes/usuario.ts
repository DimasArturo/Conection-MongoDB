import { Router, Request, Response } from "express";
import { Usuario } from "../models/usuario.model";
import bcrypt from 'bcrypt';
import Token from "../classes/token";
import { verificaToken } from "../middlewares/autenticacion";

const userRoutes = Router();

// Login
userRoutes.post('/login', async (req: Request, res: Response) => {
    try {
        const body = req.body;

        // Buscar usuario en la base de datos sin callback
        const userDB = await Usuario.findOne({ email: body.email });

        // Verificar si el usuario existe
        if (!userDB) {
            res.json({
                ok: false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
            return;
        }
        // Verificar la contraseña
        if (await userDB.CompararPassword(body.password)) {
            const tokenUser = Token.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                email: userDB.email,
                avatar: userDB.avatar
            });
            res.json({
                ok: true,
                token: tokenUser
            });
        } else {
            res.json({
                ok: false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
        }
    } catch (err) {
        res.json({
            ok: false,
            mensaje: 'Error en el servidor',
            error: err
        });
    }
});

// Registro de usuario
userRoutes.post('/create', async (req: Request, res: Response) => {
    try {
        const user = {
            nombre: req.body.nombre,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            avatar: req.body.avatar
        };

        // Crear usuario en la base de datos
        const userDB = await Usuario.create(user);
        const tokenUser = Token.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });
        res.json({
            ok: true,
            token: tokenUser
        });
    } catch (err) {
        console.error('Error al crear el usuario:', err);
        res.status(500).json({
            ok: false,
            message: 'Error al crear el usuario',
            error: err
        });
    }
});

// Actualizar usuario
userRoutes.post('/update', verificaToken, async (req: any, res: Response) => {
    const user = {
        nombre: req.body.nombre || req.usuario.nombre,
        email: req.body.email || req.usuario.email,
        avatar: req.body.avatar || req.usuario.avatar
    };

    try {
        const userDB = await Usuario.findByIdAndUpdate(req.usuario._id, user, { new: true });

        if (!userDB) {
            res.json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID'
            });
            return;
        }

        const tokenUser = Token.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });

        res.json({
            ok: true,
            token: tokenUser
        });
    } catch (err) {
        res.json({
            ok: false,
            mensaje: 'Error en el servidor',
            error: err
        });
    }
});

userRoutes.get('/', [verificaToken], (req: any, res: Response) => {
    const usuario = req.usuario;
    res.json({
        ok: true,
        usuario
    });
});


export default userRoutes;
