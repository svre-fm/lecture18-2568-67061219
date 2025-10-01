import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type {
  User,
  CustomRequest,
  UserPayload,
  Enrollment,
} from "../libs/types.js";

import { students, enrollments, reset_enrollments, courses } from "../db/db.js";
import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddleware.js";
import { checkRoles } from "../middlewares/checkRoleMiddleware.js";
import { zEnrollmentBody } from "../libs/zodValidators.js";
import { success } from "zod";
import { checkRoleStudent } from "../middlewares/checkRoleStudentMiddleware.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  checkRoleAdmin,
  (req: CustomRequest, res: Response) => {
    try {
      return res.status(200).json({
        success: true,
        message: "Enrollments Information",
        data: enrollments,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

router.get(
  "/:studentId",
  authenticateToken,
  checkRoles,
  (req: CustomRequest, res: Response) => {
    try {
      let student = students.filter(
        (std) => std.studentId === req.params.studentId
      );
      if (req.user?.role === "ADMIN") {
        return res.status(200).json({
          success: true,
          message: "Student Information",
          data: student,
        });
      }

      if (
        req.user?.role === "STUDENT" &&
        req.user.studentId === req.params.studentId
      ) {
        return res.status(200).json({
          success: true,
          message: "Student Information",
          data: student,
        });
      }

      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

router.post(
  "/reset",
  authenticateToken,
  checkRoleAdmin,
  (req: CustomRequest, res: Response) => {
    try {
      reset_enrollments();
      return res.status(200).json({
        success: true,
        message: "enrollments database has been reset",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

router.post(
  "/:studentId",
  authenticateToken,
  checkRoleStudent,
  (req: CustomRequest, res: Response) => {
    try {
      const body = req.body;
      const result = zEnrollmentBody.safeParse(body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.issues[0]?.message,
        });
      }

      if (req.params.studentId !== req.user?.studentId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }
      const duplicate = enrollments.filter(
        (enr) =>
          enr.studentId === req.params.studentId &&
          enr.courseId === body.courseId
      );
      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          message: "studentId && courseId is already exists",
        });
      }

      const newEnrollment: Enrollment = {
        studentId: req.params.studentId,
        courseId: body.courseId,
      };
      enrollments.push(newEnrollment);

      return res.status(201).json({
        success: true,
        message: `Student ${req.params.studentId} && ${req.body.courseId} has been added successfully`,
        data: newEnrollment,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
      });
    }
  }
);

router.delete(
  "/:studentId",
  authenticateToken,
  checkRoleStudent,
  (req: CustomRequest, res: Response) => {
    try {
      const body = req.body;
      const parseResult = zEnrollmentBody.safeParse(body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: parseResult.error.issues[0]?.message,
        });
      }

      if(req.user?.studentId !== req.body.studentId){
        return res.status(403).json({
          success: false,
          message: "You are not allowed to modify another student's data"
        })
      }

      const foundIndex = enrollments.findIndex(
        (std) => std.studentId === body.studentId
      );

      if (foundIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Enrollment does not exists",
        });
      }
      students.splice(foundIndex, 1);

      res.json({
        success: true,
        message: `Student ${req.params.studentId} && Course ${req.body.courseId} has been deleted successfully`,
        data: enrollments
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
      });
    }
  }
);

export default router;