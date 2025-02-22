import { IUserRepository } from "../interfaces/IUserRepository";
import { User } from "../model/schema/user.schema";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(userData: Partial<User>): Promise<User> {
    console.log(userData, "userData in service");
    return await this.userRepository.create(userData);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async updateUserByEmail(email: string, role: string): Promise<User | null> {
    console.log(email, role, "in the service");
    const updatedData: Partial<User> = { role };
    return await this.userRepository.updateRoleByEmail(email, updatedData);
  }

  async updateUserById(
    id: string,
    updateData: Partial<User>
  ): Promise<User | null> {
    return await this.userRepository.updateById(id, updateData);
  }
}
