export type IStudentResponse = {
  id: string;
  examId: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  responses: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
  }[];
  score: number;
  submittedAt: Date;
};
