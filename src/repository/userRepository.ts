import { IUserRepository } from "../interfaces/IUserRepository";
import UserModel, { User } from "../model/schema/user.schema";

export class UserRepository implements IUserRepository {
  async create(user: Partial<User>): Promise<User> {
    const newUser = new UserModel(user);
    return await newUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await UserModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return await UserModel.findById(id).exec();
  }

  async updateById(
    id: string,
    updateData: Partial<User>
  ): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).exec();
  }
}
