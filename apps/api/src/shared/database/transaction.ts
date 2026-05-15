import { db, type Transaction } from "./db.js";

export type TransactionClient = Transaction;

export async function inTransaction<T>(work: (tx: TransactionClient) => Promise<T>) {
  return db.transaction(work);
}
