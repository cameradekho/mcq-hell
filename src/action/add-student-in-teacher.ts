// "use server";
// import { mongodb } from "@/lib/mongodb";
// import { logger } from "@/models/logger";
// import { IStudents } from "@/models/student";
// import { teacherCollectionName } from "@/models/teacher";
// import { ServerActionResult } from "@/types";

// export type AddStudentInTeacherResult = ServerActionResult<undefined>;

// export type AddStudentInTeacherData = {
//   teacherId: string;
//   studentId: string;
//   studentName: string;
//   studentEmail: string;
//   studentAvatar: string;
// };

// export const addStudentInTeacher = async (
//   data: AddStudentInTeacherData
// ): Promise<AddStudentInTeacherResult> => {
//   try {
//     if (
//       !data.teacherId ||
//       !data.studentId ||
//       !data.studentName ||
//       !data.studentEmail
//     ) {
//       return {
//         success: false,
//         message:
//           "Please provide teacherId, studentId, studentName and studentEmail",
//       };
//     }
//     await mongodb.connect();

//     const existingTeacher = await mongodb
//       .collection(teacherCollectionName)
//       .findOne({ id: data.teacherId });

//     if (!existingTeacher) {
//       return {
//         success: false,
//         message: "Teacher not found",
//       };
//     }

//     const existingStudent = existingTeacher.students.find(
//       (student: IStudents) => student._id === data.studentId
//     );
//     if (existingStudent) {
//       return {
//         success: false,
//         message: "Student already exists",
//       };
//     }

//     await mongodb.collection(teacherCollectionName).updateOne(
//       { id: data.teacherId },
//       {
//         $push: {
//           students: {
//             id: data.studentId,
//             name: data.studentName,
//             email: data.studentEmail,
//             avatar: data.studentAvatar,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           },
//         } as any,
//       }
//     );
//     return {
//       success: true,
//       data: undefined,
//       message: "Student added successfully",
//     };
//   } catch (error: any) {
//     await logger({
//       error: error.message,
//       errorStack: error.stack,
//     });
//     return {
//       success: false,
//       message: "Error adding student",
//     };
//   }
// };
