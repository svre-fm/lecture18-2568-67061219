import { Router, type Request, type Response } from "express";
import {
  zCourseId,
  zCoursePostBody,
  zCoursePutBody,
} from "../libs/zodValidators.js";

import type { Student, Course } from "../libs/types.js";

import { courses } from "../db/db.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: courses,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.get("/:courseId", (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const parseResult = zCourseId.safeParse(courseId);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex(
      (c: Course) => c.courseId === courseId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Course ${courseId} does not exists`,
      });
    }

    res.status(200).json({
      success: true,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  return res.status(500).json({
    success: false,
    message: "POST /api/v2/courses has not been implemented yet",
  });
});

router.put("/", (req: Request, res: Response) => {
  return res.status(500).json({
    success: false,
    message: "PUT /api/v2/courses has not been implemented yet",
  });
});

router.delete("/", (req: Request, res: Response) => {
  return res.status(500).json({
    success: false,
    message: "DELETE /api/v2/courses has not been implemented yet",
  });
});

export default router;