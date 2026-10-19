import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { authApiEnabled } from "./auth-api";
import { getJobRepository } from "./jobs";
import { getProvinceNames } from "./locations";
import { createCandidateWorkspace } from "@/mocks/candidate-workspace";

// Only the explicitly separate preview namespace may receive fixture data.
export const getCandidatePreview = cache(async () => {
  await connection();
  if (authApiEnabled()) notFound();
  const [{ jobs, today }, cities] = await Promise.all([
    getJobRepository(),
    getProvinceNames(),
  ]);
  return createCandidateWorkspace(jobs, today, cities);
});
