import { InputCourseStaffInterface, CourseStaffInterface } from "../interfaces";
import Models from "../models";

export class CourseStaffRepository {
  public async findAllByCourse(courseId: number): Promise<CourseStaffInterface[]> {
    return Models.CourseStaff.findAll({
      where: { courseId },
      include: [{ model: Models.Users, as: "user", attributes: ["id", "name", "email", "avatarUrl"] }],
      order: [["assignedAt", "ASC"]],
    });
  }

  public async findByCourseAndUser(courseId: number, userId: number): Promise<CourseStaffInterface | null> {
    return Models.CourseStaff.findOne({ where: { courseId, userId } });
  }

  public async findById(id: number): Promise<CourseStaffInterface | null> {
    return Models.CourseStaff.findByPk(id);
  }

  public async create(data: InputCourseStaffInterface): Promise<CourseStaffInterface> {
    return Models.CourseStaff.create(data);
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.CourseStaff.destroy({ where: { id } })) > 0;
  }
}
