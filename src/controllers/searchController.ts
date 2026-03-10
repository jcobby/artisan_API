import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const searchArtisans = async (req: Request, res: Response) => {
  try {
    const { profession, location, rating, page = "1", limit = "10", sort = "rating" } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const filters: any = {};

    if (profession) {
      filters.profession = {
        contains: String(profession),
        mode: "insensitive"
      };
    }

    if (location) {
      filters.location = {
        contains: String(location),
        mode: "insensitive"
      };
    }

    if (rating) {
      filters.rating = {
        gte: Number(rating)
      };
    }

    const artisans = await prisma.artisanProfile.findMany({
      where: filters,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        [String(sort)]: "desc"
      },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber
    });

    const total = await prisma.artisanProfile.count({
      where: filters
    });

    res.status(200).json({
      success: true,
      page: pageNumber,
      limit: limitNumber,
      total,
      data: artisans
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search artisans"
    });
  }
};