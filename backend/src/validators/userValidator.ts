import { z } from "zod";
import { RoleEnum } from "../enums/roleEnum";

export const assignRoleValidator = z.object({
  role: z.enum(RoleEnum),
});