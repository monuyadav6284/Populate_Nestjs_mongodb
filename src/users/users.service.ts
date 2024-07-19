import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { USER_MODEL, UserDocument } from "../schemas/user";
import { CreateUserDTO, UpdateUserDTO } from "./dto";
import { AccountLoginDTO } from './dto/account-login.dto';
import { compare } from 'bcrypt'; // Import compare function from bcrypt

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USER_MODEL) private readonly userModel: Model<UserDocument>
  ) { }

  async create(createUserDto: CreateUserDTO) {
    try {
      const createdUser = await this.userModel.create(createUserDto);

      return createdUser;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new BadRequestException(error.errors);
      }

      throw new ServiceUnavailableException();
    }
  }

  async login(accountLoginDTO: AccountLoginDTO) {
    const { email, password } = accountLoginDTO;
    const user = await this.userModel.findOne({ email }, "+password");
    if (!user) {
      throw new NotFoundException("emsil password not found");
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new NotFoundException("emsil password not found");
    }
    return user;

  }

  async findAll() {
    const users = await this.userModel.find();

    return users;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDTO) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return updatedUser;
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new NotFoundException("User not found");
    }

    return {
      _id: id,
    };
  }
}