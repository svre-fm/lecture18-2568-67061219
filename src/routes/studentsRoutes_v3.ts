import { Router, type Request, type Response } from "express";
import {
  zStudentPostBody,
  zStudentPutBody,
  zStudentId,
} from "../libs/zodValidators.js";

import type { Student } from "../libs/types.js";
import notFoundMiddleware from "../middlewares/notFoundMiddleware.js";
import { readDataFile, writeDataFile } from "../db/db_transactions.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const students = await readDataFile();

    const program = req.query.program;

    if (program) {
      let filtered_students = students.filter(
        (student) => student.program === program
      );
      return res.json({
        success: true,
        data: filtered_students,
      });
    } else {
      return res.json({
        success: true,
        data: students,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.get("/:studentId", async (req: Request, res: Response) => {
  try {
    const students = await readDataFile();

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
    return res.json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const students = await readDataFile();

    const body = req.body as Student;

    const result = zStudentPostBody.safeParse(body); // check zod
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
      return res.status(400).json({
        success: false,
        message: "Student is already exists",
      });
    }

    const new_student = body;
    students.push(new_student);
    await writeDataFile(students);

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

router.put("/", async (req: Request, res: Response) => {
  try {
    const students = await readDataFile();

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
    await writeDataFile(students);

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

router.delete("/", async (req: Request, res: Response) => {
  try {
    const students = await readDataFile();

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

    console.log(foundIndex);
    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    students.splice(foundIndex, 1);
    await writeDataFile(students);

    res.json({
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