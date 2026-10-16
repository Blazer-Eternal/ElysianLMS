import { RoleEnum } from "../enums/roleEnum";
import { InputUserInterface, UserInterface } from "../interfaces";
import { UserRepository } from "../repositories";
import { AppError } from "../utils";

export class UserServices {
  private userRepository = new UserRepository();

  // used by the admin seeder
  public async findOne(email: string): Promise<UserInterface | null> {
    return this.userRepository.findByEmail(email);
  }

  public async create(data: InputUserInterface): Promise<UserInterface> {
    return this.userRepository.create(data);
  }

  public async getAllUsers() {
    return this.userRepository.findAll();
  }

  public async assignRole(id: number, role: RoleEnum): Promise<void> {
    // defense in depth: the route validates with Zod, but never trust one layer alone
    if (!Object.values(RoleEnum).includes(role)) {
      throw new AppError(400, `Invalid role. Must be one of: ${Object.values(RoleEnum).join(", ")}`);
    }
    if (!(await this.userRepository.findById(id))) {
      throw new AppError(404, "User not found");
    }
    await this.userRepository.update(id, { role });
  }

  public async deleteUser(id: number): Promise<void> {
    if (!(await this.userRepository.delete(id))) {
      throw new AppError(404, "User not found");
    }
  }
}