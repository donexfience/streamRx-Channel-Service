import { User } from "../model/schema/user.schema";

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateById(id: string, updateData: Partial<User>): Promise<User | null>;
  updateRoleByEmail(email: string, updateData: Partial<User>): Promise<User | null>;
}
