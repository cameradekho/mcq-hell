import StudentExamAuthButton from "@/components/auth/student-exam-auth-button";
import React from "react";

type Props = {
  teacherId: string;
  examId: string;
};

export const LoginForm = (props: Props) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-700 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Student Exam Access
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          You must be signed in to access the exam. Click the button below to
          sign in with your student account.
        </p>
        <StudentExamAuthButton
          props={{
            teacherId: props.teacherId,
            examId: props.examId,
          }}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Your email will be used to identify your submission.
        </p>
      </div>
    </div>
  );
};
