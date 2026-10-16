import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { RoleEnum } from "../enums/roleEnum";
import { UserRepository } from "../repositories";
import { AppError } from "../utils";

export class AuthServices {
  private userRepository = new UserRepository();

  // Signup always creates a student
  public async signup(data: { name: string; email: string; password: string }) {
    if (await this.userRepository.findByEmail(data.email)) {
      throw new AppError(409, `User with email ${data.email} already exists!`);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: RoleEnum.student,
    });
  }

  public async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    // same error for "no such user" and "wrong password"
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !isValid) {
      throw new AppError(401, "Invalid credentials!");
    }
    if (user.isBanned) {
      throw new AppError(403, "Your account has been banned.");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "24h" }
    );

    return { token, user };
  }

  public async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppError(400, "Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });
  }
}