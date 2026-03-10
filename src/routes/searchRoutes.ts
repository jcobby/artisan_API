import { Request, Response } from "express";
import express from "express";
import { getArtisanById, searchArtisans } from "../controllers/searchController";
const router = express.Router();

router.get('/artisans', searchArtisans)
router.get('/artisans/:id', getArtisanById)
router.get('/artisans/search/category/:category', (req:Request, res:Response) => {

})

export default router