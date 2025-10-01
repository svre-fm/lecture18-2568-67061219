import { Router, type Request, type Response } from "express";
import {
  zStudentPostBody,
  zStudentPutBody,
  zStudentId,
} from "../libs/zodValidators.js";

import type { Student, Course } from "../libs/types.js";

import { students, courses } from "../db/db.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  try {
    const program = req.query.program;

    if (program) {
      let filtered_students = students.filter(
        (student) => student.program === program
      );
      return res.status(200).json({
        success: true,
        data: filtered_students,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: students,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.get("/:studentId", (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = students.findIndex(
      (std: Student) => std.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    res.json({
      success: true,
      data: students[foundIndex],
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
  try {
    const body = (await req.body) as Student;

    const result = zStudentPostBody.safeParse(body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.status(409).json({
        success: false,
        message: "Student is already exists",
      });
    }

    const new_student = body;
    students.push(new_student);

    res.set("Link", `/students/${new_student.studentId}`);

    return res.status(201).json({
      success: true,
      data: new_student,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.put("/", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    const result = zStudentPutBody.safeParse(body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    students[foundIndex] = { ...students[foundIndex], ...body };

    res.set("Link", `/students/${body.studentId}`);

    return res.status(200).json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.delete("/", (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parseResult = zStudentId.safeParse(body.studentId);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = students.findIndex(
      (std: Student) => std.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    students.splice(foundIndex, 1);

    res.status(200).json({
      success: true,
      message: `Student ${body.studentId} has been deleted successfully`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

export default router;