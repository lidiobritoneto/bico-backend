import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async updateMe(
    userId: string,
    dto: {
      name?: string;
      phone?: string | null;
      avatarBase64?: string | null;
    },
  ) {
    const u = await this.repo.findOne({ where: { id: userId } });
    if (!u) return null;

    if (dto.name !== undefined) u.name = dto.name;
    if (dto.phone !== undefined) u.phone = dto.phone;
    if (dto.avatarBase64 !== undefined) u.avatarBase64 = dto.avatarBase64;

    return this.repo.save(u);
  }

  async createUser(params: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    role: UserRole;
  }) {
    const u = this.repo.create({
      name: params.name,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      phone: params.phone ?? null,
      role: params.role,
      avatarBase64: null,
    });
    return this.repo.save(u);
  }
}