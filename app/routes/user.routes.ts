import { Router } from 'express';
import userController from '../controllers/user.controller';
import upload from '../helpers/imageUpload.helper';
const route = Router();

route.post('/register/user', upload.any(), userController.createUser);
route.get('/account/confirmation/:token', userController.verifyEmail);
route.post('/login/user', userController.loginUser);
route.get('/fetch/user/:id', userController.getUserProfile);
route.put('/update/user/:id', upload.any(), userController.updateUserProfile);

export default route;