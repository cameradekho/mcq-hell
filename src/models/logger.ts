import { nanoid } from "nanoid";
import { mongodb } from "@/lib/mongodb";
import { ILog, logCollectionName } from "./logs";

export async function logger(info: object) {
  try {
    console.log(info);
    await mongodb.connect();

    const id = nanoid(64);

    await mongodb.collection<ILog>(logCollectionName).insertOne({
      id: id,
      createdAt: new Date().getTime(),
      info: JSON.stringify(info),
    });
  } catch {}
}
