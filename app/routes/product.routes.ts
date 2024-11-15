import { Router } from 'express';
import productController from '../controllers/product.controller';
import upload from '../helpers/imageUpload.helper';
const route = Router();

route.post('/create/product', upload.any(), productController.createProduct);
route.get('/get/products', productController.getAllProducts);
route.get('/get/products/:id', productController.getProductById)
route.put('/update/product/:id', upload.any(), productController.updateProduct);
route.get('/delete/product/:id', productController.softyDeleteProduct);

export default route;