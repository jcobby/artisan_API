import express from 'express';
import { getArtisans, loginUser, registerUser } from '../controllers/userController';
const { Router } = express;

const router = Router();

// router.get('/users', getUsers);
router.get("/artisans", getArtisans)

router.post('/register', registerUser)
router.post('/login', loginUser)

router.get('/users/:id', (req, res) => {
    res.send(`Get user with id ${req.params.id}`);
});

router.put('/users/:id', (req, res) => {
    res.send(`Update user with id ${req.params.id}`);
});

router.delete('/users/:id', (req, res) => {
    res.send(`Delete user with id ${req.params.id}`);
});

export default router