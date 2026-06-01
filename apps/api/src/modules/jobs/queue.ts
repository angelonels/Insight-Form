import { Queue } from "bullmq";

import { env } from "../../shared/config/env.js";
import { logger } from "../../shared/logger/logger.js";
import type { JobPayloadMap } from "./job-payloads.js";
import { QueueNames } from "./job-names.js";

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];
export type JobName = keyof JobPayloadMap;

export type EnqueuedJob = {
  queueName: QueueName;
  jobName: JobName;
  payload: JobPayloadMap[JobName];
};

const inMemoryJobs: EnqueuedJob[] = [];
const queues = new Map<QueueName, Queue>();

export function getRedisConnectionOptions() {
  const redisUrl = new URL(env.REDIS_URL);
  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    password: redisUrl.password || undefined,
    username: redisUrl.username || undefined,
    db: redisUrl.pathname.length > 1 ? Number(redisUrl.pathname.slice(1)) : undefined,
    maxRetriesPerRequest: null,
  };
}

function getQueue(queueName: QueueName) {
  const existingQueue = queues.get(queueName);
  if (existingQueue) {
    return existingQueue;
  }

  const queue = new Queue(queueName, {
    connection: getRedisConnectionOptions(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2_000,
      },
      removeOnComplete: 500,
      removeOnFail: 1_000,
    },
  });

  queues.set(queueName, queue);
  return queue;
}

export async function enqueueJob<TJobName extends JobName>(
  queueName: QueueName,
  jobName: TJobName,
  payload: JobPayloadMap[TJobName],
) {
  if (env.NODE_ENV === "test") {
    inMemoryJobs.push({ queueName, jobName, payload });
    return;
  }

  logger.info({ queueName, jobName, payload }, "Enqueuing job");
  await getQueue(queueName).add(jobName, payload);
}

export function getInMemoryJobs() {
  return [...inMemoryJobs];
}

export function clearInMemoryJobs() {
  inMemoryJobs.splice(0, inMemoryJobs.length);
}

export async function closeQueues() {
  await Promise.all([...queues.values()].map((queue) => queue.close()));
  queues.clear();
}
