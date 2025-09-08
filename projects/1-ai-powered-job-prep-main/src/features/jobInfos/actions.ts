"use server";

import z from "zod";
import { jobInfoSchema } from "./schemas";
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from "./db";
import { redirect } from "next/navigation";
import { withAuthRedirect } from "@/lib/auth";
import { verifyJobInfoAccess } from "@/lib/resourceAuth";

export const createJobInfo = withAuthRedirect(
  async (userId, unsafeData: z.infer<typeof jobInfoSchema>) => {
    const { success, data } = jobInfoSchema.safeParse(unsafeData);
    if (!success) {
      throw new Error("Invalid job data");
    }

    const jobInfo = await insertJobInfo({ ...data, userId });
    redirect(`/app/job-infos/${jobInfo.id}`);
  }
);

export const updateJobInfo = withAuthRedirect(
  async (
    userId,
    {
      id,
      unsafeData,
    }: { id: string; unsafeData: z.infer<typeof jobInfoSchema> }
  ) => {
    const { success, data } = jobInfoSchema.safeParse(unsafeData);
    if (!success) {
      throw new Error("Invalid job data");
    }

    const existingJobInfo = await verifyJobInfoAccess(id, userId);
    if (existingJobInfo == null) {
      throw new Error("You don't have permission to do this");
    }

    const jobInfo = await updateJobInfoDb(id, data);
    redirect(`/app/job-infos/${jobInfo.id}`);
  }
);
