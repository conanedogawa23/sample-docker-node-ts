import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import Image, { IImage } from '../models/image.model';
import { database } from '../config/db';

const db = database.getInstance();
const gridFSBucket = new GridFSBucket(db, { bucketName: 'images' });

export default class ImageController {
  public async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const file: Express.Multer.File = req.file as Express.Multer.File;
      const { originalname, mimetype } = file;
      const { description } = req.body;

      // Create a GridFS writable stream to store the image data in chunks
      const writeStream = gridFSBucket.openUploadStream(originalname, { metadata: { description, mimeType: mimetype } });
      createReadStream(file.path).pipe(writeStream);

      writeStream.on('error', (error) => {
        console.error('Error uploading image:', error.message);
        res.status(500).json({ error: 'Failed to upload image' });
      });

      writeStream.on('finish', async () => {
        // Save image metadata to MongoDB
        const image: IImage = await Image.create({ filename: originalname, description, mimeType: mimetype, fileId: writeStream.id });
        res.status(201).json(image);
      });
    } catch (error) {
      console.error('Error uploading image:', error.message);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  public async getImageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const image = await Image.findById(id);
      if (!image) {
        res.status(404).json({ error: 'Image not found' });
        return;
      }

      // Get the image file using the GridFS read stream
      const readStream = gridFSBucket.openDownloadStream(image.fileId);
      res.setHeader('Content-Type', image.mimeType);
      readStream.pipe(res);
    } catch (error) {
      console.error('Error fetching image:', error.message);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  }
}
