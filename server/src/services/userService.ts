import { User } from "../models/User";

export class UserService {
  static async createIfNotExists(data: any) {
    const existingUser = await User.findOne({
      where: [{ email: data.email }, { login: data.login }],
    });
    if (existingUser) throw new Error('Email or login already exists');
    const user = User.create(data);
    await user.save();
    return user;
  }
}
