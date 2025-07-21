import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const newObjectId = new ObjectId();

    return Response.json({
      success: true,
      objectId: newObjectId.toString(),
      timestamp: newObjectId.getTimestamp(),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to generate ObjectId",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
