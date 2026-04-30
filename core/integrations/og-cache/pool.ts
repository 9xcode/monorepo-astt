/**
 * Concurrency pool to limit parallel promise execution.
 */
export async function runInPool<T>(
  concurrency: number,
  items: T[],
  asyncFn: (item: T) => Promise<void>
): Promise<void> {
  const pool = new Set<Promise<void>>();
  
  for (const item of items) {
    const p = asyncFn(item).finally(() => {
      pool.delete(p);
    });
    
    pool.add(p);
    
    if (pool.size >= concurrency) {
      await Promise.race(pool);
    }
  }
  
  await Promise.all(pool);
}
