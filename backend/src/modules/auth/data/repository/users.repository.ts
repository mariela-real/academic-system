import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entity/user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email: email.toLowerCase() });
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  findAll(): Promise<User[]> {
    return this.repository.find({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
      order: { fullName: 'ASC' },
    })
  }

  create(user: Partial<User>): Promise<User> {
    return this.repository.save(this.repository.create(user))
  }
}
