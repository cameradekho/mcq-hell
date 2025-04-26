// import { IExam } from "@/models/exam";
// import { logger } from "@/models/logger";
// import { ServerActionResult } from "@/types";
// import { fetchTeacherById } from "./fetch-teacher-by-id";
// import { fetchExamById } from "./fetch-exam-by-id";
// import { mongodb } from "@/lib/mongodb";

// export type UpdateExamByTeacherResult = ServerActionResult<undefined>;

// export type UpdateExamByTeacherData = {
//   teacherId: string;
//   examId: string;
//   exams: IExam;
// };

// export const updateExamByTeacher = async (
//   data: UpdateExamByTeacherData
// ): Promise<UpdateExamByTeacherResult> => {
//     try {
//         if (!data.teacherId || !data.examId || !data.exams) {
//             return {
//                 success: false,
//                 message: "Please provide teacherId, examId and exams",
//             };
//         }

// const teacherResult = await fetchTeacherById({ teacherId: data.teacherId });
// if (!teacherResult.success || !teacherResult.data) {
//     return {
//         success: false,
//         message: "Teacher not found",
//     };
// }

// const examExits = await fetchExamById({ teacherId: data.teacherId, examId: data.examId });
// if (!examExits) {
//     return {
//         success: false,
//         message: "Exam not found",
//     };
// }

//         await mongodb.connect();

//         const result = await.mongodb.collection("teacher").updateOne(
//             { _id: teacherResult.data._id },
//             {
//                 $set: {
//                     "exams.$[exam].name": data.exams.name,
//                     "exams.$[exam].description": data.exams.description,
//                     "exams.$[exam].duration": data.exams.duration,
//                     "exams.$[exam].questions": data.exams.questions,
//                 },
//             },
//             {
//                 arrayFilters: [
//                     {
//                         "exam._id": data.examId,
//                     },
//                 ],
//             }
//         );

//         if (!result.acknowledged) {
//             return {
//                 success: false,
//                 message: "Failed to update exam",
//             };
//         }

//         const exam = await fetchExamById({ teacherId: data.teacherId, examId: data.examId });

//         if (!exam) {
//             return {
//                 success: false,
//                 message: "Failed to update exam",
//             };
//         }

//         return {
//             success: true,
//             data: undefined,
//             message: "Exam updated successfully",
//         };

//     } catch (error:any) {
//         await logger({
//             error: error.message,
//             errorStack: error.stack,
//         });
//         return {
//             success: false,
//             message: "Error updating exam",
//         };
//     }
// }
