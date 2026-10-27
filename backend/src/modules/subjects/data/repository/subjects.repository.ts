import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../domain/entity/subject.entity.js';

@Injectable()
export class SubjectsRepository {
  constructor(
    @InjectRepository(Subject)
    private readonly repository: Repository<Subject>,
  ) {}

  findAll(): Promise<Subject[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Subject | null> {
    return this.repository.findOneBy({ id });
  }

  create(subject: Pick<Subject, 'code' | 'name' | 'description'>): Promise<Subject> {
    return this.repository.save(this.repository.create(subject));
  }

  async update(id: string, values: Partial<Subject>): Promise<Subject | null> {
    await this.repository.update({ id }, values);

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });

    return (result.affected ?? 0) > 0;
  }
}
