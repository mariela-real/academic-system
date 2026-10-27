import { Subject } from '../../src/modules/subjects/domain/entity/subject.entity.js';

export class SubjectBuilder {
  private readonly subject = Object.assign(new Subject(), {
    id: '00000000-0000-4000-8000-000000000001',
    code: 'MAT-101',
    name: 'Matemática',
    description: 'Materia académica',
  });

  withCode(code: string): this {
    this.subject.code = code;
    return this;
  }

  withName(name: string): this {
    this.subject.name = name;
    return this;
  }

  withDescription(description: string | null): this {
    this.subject.description = description;
    return this;
  }

  build(): Subject {
    return Object.assign(new Subject(), this.subject);
  }
}
