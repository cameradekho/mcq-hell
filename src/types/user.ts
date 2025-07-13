import { TDocument } from "./common";

export type TUser = TDocument & {
  email?: string;
  name?: string;
  phone?: string;
};
