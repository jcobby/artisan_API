import { Request, Response } from "express";
import express from "express";
import { searchArtisans } from "../controllers/searchController";
const router = express.Router();

router.get('/artisans/search', searchArtisans)

router.get('/artisans/search/:query', (req:Request, res:Response) => {

})

router.get('/artisans/search/category/:category', (req:Request, res:Response) => {

})

export default router