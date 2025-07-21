// "use server";
// import { mongodb } from "@/lib/mongodb";
// import { IExam, examCollectionName } from "@/models/exam";
// import { logger } from "@/models/logger";
// import { teacherCollectionName, ITeacher } from "@/models/teacher";
// import { studentResponseCollectionName } from "@/models/students-response";
// import { ServerActionResult } from "@/types";

// export type DashboardStats = {
//   totalExams: number;
//   activeExams: number;
//   pendingReviews: number;
// };

// export type FetchDashboardStatsResult = ServerActionResult<DashboardStats>;

// export const fetchDashboardStats = async (
//   userEmail: string
// ): Promise<FetchDashboardStatsResult> => {
//   try {
//     if (!userEmail) {
//       return {
//         success: false,
//         message: "Please provide userEmail",
//       };
//     }

//     await mongodb.connect();

//     // Find teacher in the database
//     const teacher = (await mongodb.collection(teacherCollectionName).findOne({
//       email: userEmail,
//     })) as ITeacher | null;

//     if (!teacher) {
//       return {
//         success: true,
//         data: {
//           totalExams: 0,
//           activeExams: 0,
//           pendingReviews: 0,
//         },
//         message: "No teacher found with this email",
//       };
//     }

//     // Get total number of exams for this teacher
//     const totalExams = teacher.exam?.length || 0;

//     // Get active exams count (exams that have an active end date in the future)
//     const now = new Date();
//     const activeExams =
//       teacher.exam?.filter((exam) => {
//         // For this example, I'm considering all exams as active
//         // In a real scenario, you might need to add a status field to the exam model
//         return true;
//       }).length || 0;

//     // Get pending reviews count
//     // This finds student responses for exams created by this teacher
//     // that haven't been reviewed yet
//     const pendingReviews = await mongodb
//       .collection(studentResponseCollectionName)
//       .countDocuments({
//         "examAttempts.teacherEmail": userEmail,
//         // Add additional filters if needed to determine what counts as "pending review"
//       });

//     return {
//       success: true,
//       data: {
//         totalExams,
//         activeExams,
//         pendingReviews,
//       },
//       message: "Dashboard stats fetched successfully",
//     };
//   } catch (error: any) {
//     await logger({
//       error,
//       errorStack: error.stack,
//     });
//     return {
//       success: false,
//       message: `Error fetching dashboard stats: ${
//         error instanceof Error ? error.message : error
//       }`,
//     };
//   }
// };
