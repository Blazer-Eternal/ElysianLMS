import { InputUserInterface, UserInterface } from "../interfaces";
import Models from "../models";

export class UserRepository {
  public async findAll() {
    return Models.Users.findAll({
      attributes: ["id", "name", "email", "role", "avatarUrl", "isBanned", "createdAt"],
      order: [["id", "ASC"]],
    });
  }

  public async findById(id: number): Promise<UserInterface | null> {
    return Models.Users.findByPk(id);
  }

  public async findByEmail(email: string): Promise<UserInterface | null> {
    return Models.Users.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  public async create(data: InputUserInterface): Promise<UserInterface> {
    return Models.Users.create(data);
  }

  public async update(id: number, data: Partial<InputUserInterface>): Promise<void> {
    await Models.Users.update(data, { where: { id } });
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.Users.destroy({ where: { id } })) > 0;
  }
}