import {Schema, model, Document} from 'mongoose'
import bycrypt from 'bcrypt';



const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    avatar: {
        type: String,
        default: 'av-1.png'
    },
    email:{
        type: String,
        unique: true,
        required: [true ,'El correo es obligatorio']
    },
    password:{
        type: String,
        required: [true, 'La contrasela es necesaria']

    }
});

usuarioSchema.method('CompararPassword', function(password:string = ''): boolean{
if (bycrypt.compareSync(password, this.password)){
    return true;
}else{
    return false
}
});

interface IUsuario extends Document{
    nombre: string,
    email: string,
    password: string,
    avatar: string;

    CompararPassword(password: string):boolean;
}

export const Usuario = model<IUsuario>('Usuario', usuarioSchema);


