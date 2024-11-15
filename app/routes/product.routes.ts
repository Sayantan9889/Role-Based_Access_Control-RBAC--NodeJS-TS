import { Router } from 'express';
import productController from '../controllers/product.controller';
import upload from '../helpers/imageUpload.helper';
const route = Router();

route.post('/api/products', upload.any(), productController.createProduct);
route.get('/api/get/products', productController.getAllProducts);

export default route;