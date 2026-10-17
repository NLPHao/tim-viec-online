import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { isJobOpen, vietnamToday } from "../features/jobs/formatters";
import { filterJobs, paginateJobs } from "../features/jobs/query";
import { JOB_LEVELS, type Job, type JobQuery } from "../features/jobs/types";
import { createJobFixtures, JOB_CATEGORIES } from "../mocks/jobs";

// Components depend on this read interface. Replace its fixture implementation
// with the agreed Laravel API adapter when endpoints are available.
const repository = cache(async () => {
  await connection();
  const now = new Date();
  return { jobs: createJobFixtures(now), today: vietnamToday(now) };
});

export async function listJobs(query: JobQuery) {
  const { jobs, today } = await repository();
  return paginateJobs(filterJobs(jobs, query, today), query.page);
}

export async function getJob(id: string | number): Promise<Job | null> {
  if (!/^[1-9]\d*$/.test(String(id)) || !Number.isSafeInteger(Number(id)))
    return null;
  const { jobs } = await repository();
  return jobs.find((job) => job.id === Number(id)) ?? null;
}

export async function getJobCatalog() {
  const { jobs } = await repository();
  return {
    categories: JOB_CATEGORIES,
    cities: [...new Set(jobs.map((job) => job.city))].sort((a, b) =>
      a.localeCompare(b, "vi"),
    ),
    levels: [...JOB_LEVELS],
  };
}

export async function findRelatedJobs(job: Job, limit = 3): Promise<Job[]> {
  const { jobs, today } = await repository();
  const count = Number.isSafeInteger(limit) && limit > 0 ? limit : 3;
  return jobs
    .filter(
      (candidate) =>
        candidate.id !== job.id &&
        candidate.category_id === job.category_id &&
        isJobOpen(candidate, today),
    )
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id)
    .slice(0, count);
}
