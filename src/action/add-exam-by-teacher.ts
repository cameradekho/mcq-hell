// "use server";
// import { mongodb } from "@/lib/mongodb";
// import { logger } from "@/models/logger";
// import { ServerActionResult } from "@/types";
// import { ObjectId } from "mongodb";

// export type AddExamByUserResult = ServerActionResult<undefined>;

// type AddExamByTeacherData = {
//   userEmail: string;
//   examName: string;
//   examDescription: string;
//   duration: number;
//   questions: Array<{
//     _id?: ObjectId;
//     question: string;
//     image?: string;
//     options: Array<{
//       _id?: ObjectId;
//       text?: string;
//       image?: string;
//       isCorrect?: boolean;
//     }>;
//   }>;
// };
// export const addExamByTeacher = async (
//   data: AddExamByTeacherData
// ): Promise<AddExamByUserResult> => {
//   try {
//     if (
//       !data.userEmail ||
//       !data.examName ||
//       !data.examDescription ||
//       !data.duration ||
//       data.questions.length === 0
//     ) {
//       return {
//         success: false,
//         message: "..Please provide all the required fields",
//       };
//     }

//     await mongodb.connect();

//     const userData = await mongodb
//       .collection("teacher")
//       .findOne({ email: data.userEmail });

//     if (!userData) {
//       return {
//         success: false,
//         message: "Teacher does not exist",
//       };
//     }

//     const examData = await mongodb
//       .collection("exam")
//       .findOne({ name: data.examName });

//     if (examData) {
//       return {
//         success: false,
//         message: "Exam already exists",
//       };
//     }

//     console.log(
//       data.questions.map((q) => q.options.map((opt) => opt.text || "empty"))
//     );

//     const resofUpdate = await mongodb.collection("Exam").insertOne({
//       name: data.examName,
//       createdByEmail: data.userEmail,
//       description: data.examDescription,
//       duration: data.duration,
//       questions: data.questions.map((q) => {
//         // const questionId = new ObjectId(); // Generate a question ID
//         const optionsWithIds = q.options.map((opt) => ({
//           _id: new ObjectId(), // Option ID
//           textAnswer: opt.text,
//           image: opt.image || "",
//           isCorrect: opt.isCorrect || false,
//         }));

//         return {
//           // _id: questionId, // ✅ Actually assign it now
//           question: q.question,
//           image: q.image || "",
//           options: optionsWithIds,
//           answer: optionsWithIds
//             .filter((opt) => opt.isCorrect)
//             .map((opt) => opt._id),
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         };
//       }),

//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//     console.log("result is : ", resofUpdate.acknowledged);

//     if (!resofUpdate.acknowledged) {
//       return {
//         success: false,
//         message: "....Error adding exam by user",
//       };
//     }

//     return {
//       success: true,
//       data: undefined,
//       message: "Exam added successfully",
//     };
//   } catch (error: any) {
//     await logger({
//       error: error.message,
//       errorStack: error.stack,
//     });
//     return {
//       success: false,
//       message: `...Error adding exam by user: ${
//         error instanceof Error ? error.message : error
//       }`,
//     };
//   }
// };
