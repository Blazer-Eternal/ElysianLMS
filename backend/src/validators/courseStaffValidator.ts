import { z } from "zod";
import { StaffRoleEnum } from "../enums/staffRoleEnum";

export const assignStaffValidator = z.object({
  userId: z.number().int().positive(),
  staffRole: z.enum(StaffRoleEnum).optional(),
});

export const updateStaffValidator = z.object({
  staffRole: z.enum(StaffRoleEnum),
});
