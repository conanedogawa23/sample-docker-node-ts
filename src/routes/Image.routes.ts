import express from 'express';
import multer from 'multer';
import ImageController from '../controllers/image.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary upload directory

const imageController = new ImageController();

router.post('/images', upload.single('image'), imageController.uploadImage);
router.get('/images/:id', imageController.getImageById);

export default router;
