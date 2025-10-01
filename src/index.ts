import express, { type Request, type Response } from "express";

import morgan from "morgan";
import invalidJsonMiddleware from "./middlewares/invalidJsonMiddleware.js";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";

import studentRouter_v2 from "./routes/studentsRoutes_v2.js";
import studentRouter_v3 from "./routes/studentsRoutes_v3.js";
import courseRouter_v2 from "./routes/coursesRouters_v2.js";
import usersRouter_v2 from "./routes/usersRoutes_v2.js"
import enrollmentsRouter_v2 from "./routes/enrollmentsRoutes_v2.js";

const app = express();
const port = 3000;
app.use(express.json());
app.use(morgan("dev"));
app.use(invalidJsonMiddleware);
app.get("/", (req: Request, res: Response) => {
  res.send("Lecture18 API services");
});

app.get("/me", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Student Information",
    data: {
      studentId: "600610999",
      firstName: "Dome",
      lastName: "Potikanond",
      program: "CPE",
      section: "001",
    },
  });
});

app.use("/api/v2/students", studentRouter_v2);
app.use("/api/v3/students", studentRouter_v3);
app.use("/api/v2/courses", courseRouter_v2);
app.use("/api/v2/users", usersRouter_v2);
app.use("/api/v2/enrollments", enrollmentsRouter_v2);

app.use(notFoundMiddleware);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;