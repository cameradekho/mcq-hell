export type StudentAnswer = {
  questionId: string;
  question: string;
  correctOption: string;
  selectedOption: string;
  isCorrect: boolean;
};

type ExamAttempt = {
  examId: string;
  teacherEmail: string;
  responses: StudentAnswer[];
  score: {
    scored: number;
    submittedAt: Date;
  };
};

export type IStudentResponseDocument = {
  _id: string;
  // studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  examAttempts?: ExamAttempt[];
  createdAt: Date;
  updatedAt: Date;
};

export const studentResponseCollectionName = "student-response";
