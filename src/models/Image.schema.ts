import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IImage extends Document {
  filename: string;
  description: string;
  mimeType: string;
  fileId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const imageSchema: Schema<IImage> = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Image: Model<IImage> = mongoose.model('Image', imageSchema);

export default Image;
