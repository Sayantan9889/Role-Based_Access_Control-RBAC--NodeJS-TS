import { Router } from 'express';
import productController from '../controllers/product.controller';
import upload from '../helpers/imageUpload.helper';
import { isEmployee, isManager } from '../middlewares/role-guard.middleware';
const route = Router();

route.post('/create/product', upload.any(), productController.createProduct);
route.get('/get/products', productController.getAllProducts);
route.get('/get/products/:id', productController.getProductById)
route.put('/update/product/:id', isEmployee, upload.any(), productController.updateProduct);
route.get('/delete/product/:id', isEmployee, isManager, productController.softyDeleteProduct);

export default route;