import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../domain/entity/student.entity.js';

@Injectable()
export class StudentsRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
  ) {}

  findAll(): Promise<Student[]> {
    return this.repository.find({
      relations: { user: true },
      order: { studentNumber: 'ASC' },
    });
  }

  findById(id: string): Promise<Student | null> {
    return this.repository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  findByUserId(userId: string): Promise<Student | null> {
    return this.repository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  create(student: Pick<Student, 'userId' | 'studentNumber'>): Promise<Student> {
    return this.repository.save(this.repository.create(student));
  }

  async update(id: string, values: Partial<Student>): Promise<Student | null> {
    await this.repository.update({ id }, values);

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });

    return (result.affected ?? 0) > 0;
  }
}
