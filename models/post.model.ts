import { Schema, Document, model } from "mongoose";

const postSchema = new Schema({
  created: {
    type: Date,
  },
  mensaje: {
    type: String,
  },
  imgs: [
    {
      type: String,
    },
  ],
  coords: {
    type: String, // -13.313123, 12.3123123
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: [true, "Debe de existir una referencia a un usuario"],
  },
});

interface IPost extends Document {
    created: Date;
    mensaje: string;
    img: string[];
    coords: string;
    usuario: string;
  }

postSchema.pre<IPost>("save", function (next) {
  this.created = new Date();
    next();
});

export const Post = model<IPost>("Post", postSchema);


