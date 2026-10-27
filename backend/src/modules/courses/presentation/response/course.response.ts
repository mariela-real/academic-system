export type CourseResponse = {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  academicPeriod: string;
  capacity: number;
  instructor: {
    id: string;
    fullName: string;
  } | null;
};
