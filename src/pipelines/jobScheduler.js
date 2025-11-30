export default async function runModuleTasks(modules = []) {
  const tasks = modules.flatMap((manifest) => manifest.tasks || []);
  for (const task of tasks) {
    if (typeof task === 'function') {
      await task();
    }
  }
  return tasks.length;
}
