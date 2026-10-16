import { Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { EnrollmentServices } from "../../services";
import { parseId } from "../../utils";

const enrollmentServices = new EnrollmentServices();

export class EnrollmentController {
  static async getMyEnrollments(req: CustomRequestInterface, res: Response) {
    const enrollments = await enrollmentServices.getMyEnrollments(req.user);
    return res.status(200).json({ success: true, data: enrollments });
  }

  static async getCourseEnrollments(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const enrollments = await enrollmentServices.getCourseEnrollments(req.user, courseId);
    return res.status(200).json({ success: true, data: enrollments });
  }

  static async enroll(req: CustomRequestInterface, res: Response) {
    const { courseId } = req.body;
    const enrollment = await enrollmentServices.enrollInFreeCourse(req.user, courseId);
    return res.status(201).json({ success: true, message: "Enrolled successfully", data: enrollment });
  }

  static async grantEnrollment(req: CustomRequestInterface, res: Response) {
    const { courseId, userId } = req.body;
    const enrollment = await enrollmentServices.grantEnrollment(courseId, userId);
    return res.status(201).json({ success: true, message: "Enrollment granted", data: enrollment });
  }

  static async revokeEnrollment(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid enrollment id" });

    await enrollmentServices.revokeEnrollment(id);
    return res.status(200).json({ success: true, message: "Enrollment revoked" });
  }
}
