import express from 'express';
const { Router } = express;

const router = Router();

router.get('/artisans', (req, res) => {
    res.send('Get all artisans');
});

router.post('/artisans', (req, res) => {
    res.send('Create a new artisan profile');
});

router.get('/artisans/:id', (req, res) => {
    res.send(`Get artisan profile with id ${req.params.id}`);
});

router.put('/artisans/:id', (req, res) => {
    res.send(`Update artisan profile with id ${req.params.id}`);
}); 

router.delete('/artisans/:id', (req, res) => {
    res.send(`Delete artisan profile with id ${req.params.id}`);
});