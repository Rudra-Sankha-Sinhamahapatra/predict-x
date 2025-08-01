import { db,betting_board } from "@repo/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const getAllBiddings = async (req: Request, res: Response): Promise<void> => {
  try {
    const allBiddings = await db
    .select()
    .from(betting_board)
    .where(eq(betting_board,"OPEN"));

    res.status(200).json({
        msg:"fetched all active biddings",
        allBiddings
    })

  } catch (error) {
    console.log(error);
  }
}