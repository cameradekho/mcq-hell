import { ObjectId } from "mongodb";

export function generateObjectId() {
    return new ObjectId();
}