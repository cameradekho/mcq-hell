import { fetchExamById } from "@/action/fetch-exam-by-id";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";
import { mongodb } from "@/lib/mongodb";
import { IStudentExamSession } from "@/models/student-exam-session";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";

export type DeleteStudentExamSessionByTeachIdExamIdResult = ServerActionResult<
  undefined
>;

type DeleteStudentExamSessionByTeachIdExamIdData = {
  teacherId: string;
  examId: string;
};

export const deleteStudentExamSessionByTeachIdExamId = async (
  data: DeleteStudentExamSessionByTeachIdExamIdData
)=>{
    try {
        if (!data.teacherId || !data.examId) {
            return {
                success: false,
                message: "Please provide teacherId and examId",
            };
        }

        const teacherId = data.teacherId;
        const examId = data.examId;

        const teachrExists = await fetchTeacherById({
            teacherId: teacherId,
        });

        if (!teachrExists.success) {
            return {
                success: false,
                message: teachrExists.message,
            };
        }

        const examExists = await fetchExamById({
            teacherId: teacherId,
            examId: examId,
        });

        if (!examExists.success) {
            return {
                success: false,
                message: examExists.message,
            };
        }

        await mongodb.connect();

        const deleteRes = await mongodb
            .collection<IStudentExamSession>("studentExamSession")
            .deleteMany({
                examId: new ObjectId(examId),
                teacherId: new ObjectId(teacherId),
            });

        if (!deleteRes.acknowledged) {
            return {
                success: false,
                message: "Error deleting student exam session...",
            };
        }

        if (deleteRes.deletedCount === 0) {
            return {
                success: false,
                message: "No student exam session found with the provided examId and teacherId",
            };
        }

        return {
            success: true,
            data: undefined,
            message: "Student exam session deleted successfully",
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Error deleting student exam session",
        };
    }
}