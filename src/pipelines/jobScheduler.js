/**
 * =============================================================================
 * FILE: src/pipelines/jobScheduler.js
 * =============================================================================
 * 
 * @fileoverview Module Task Runner / Job Scheduler
 * 
 * @description
 * File này chạy các background tasks được định nghĩa trong các modules.
 * Tasks có thể bao gồm:
 * - Cron jobs (scheduled tasks)
 * - One-time initialization tasks
 * - Background workers setup
 * 
 * ## Cách modules định nghĩa tasks:
 * 
 * ```javascript
 * // Trong module/index.js
 * export default async function registerMyModule({ container }) {
 *   return {
 *     name: 'myModule',
 *     tasks: [
 *       async () => {
 *         // Setup cron job
 *         cron.schedule('0 * * * *', () => {
 *           console.log('Hourly task');
 *         });
 *       },
 *       async () => {
 *         // Initialize background worker
 *         await setupWorker();
 *       }
 *     ]
 *   };
 * }
 * ```
 * 
 * @module pipelines/jobScheduler
 * 
 * =============================================================================
 */

/**
 * Chạy tất cả tasks từ các modules
 * 
 * @async
 * @function runModuleTasks
 * @description
 * Collect tất cả tasks từ module manifests và chạy tuần tự.
 * Tasks được chạy theo thứ tự chúng được định nghĩa.
 * 
 * ## Lưu ý:
 * - Tasks chạy tuần tự, không parallel
 * - Nếu một task fail, các tasks sau vẫn có thể chạy
 * - Errors được propagate lên để caller xử lý
 * 
 * @param {Array<ModuleManifest>} modules - Array of module manifests
 * @returns {Promise<number>} Số lượng tasks đã chạy
 * 
 * @example
 * const manifests = await loadModules(container);
 * const taskCount = await runModuleTasks(manifests);
 * console.log(`Executed ${taskCount} background tasks`);
 */
export default async function runModuleTasks(modules = []) {
  // Flatten tất cả tasks từ các modules thành một array
  // Mỗi module có thể có 0 hoặc nhiều tasks
  const tasks = modules.flatMap((manifest) => manifest.tasks || []);
  
  // Chạy từng task tuần tự
  for (const task of tasks) {
    // Chỉ chạy nếu task là function
    if (typeof task === 'function') {
      await task();
    }
  }
  
  // Trả về số lượng tasks đã chạy (cho logging/monitoring)
  return tasks.length;
}
