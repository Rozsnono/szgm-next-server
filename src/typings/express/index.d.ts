import { UserDocument } from "../../../../../models/src/interfaces/IUser";

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}
