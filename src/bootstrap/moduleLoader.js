/**
 * =============================================================================
 * FILE: src/bootstrap/moduleLoader.js
 * =============================================================================
 * 
 * @fileoverview Module Auto-Loader cho Kick Off Hub API
 * 
 * @description
 * File này implement cơ chế tự động load các modules từ thư mục src/modules.
 * Đây là phần core của kiến trúc modular, cho phép:
 * - Tự động phát hiện và load các modules
 * - Đăng ký routes, services, models vào DI container
 * - Normalize manifests để đảm bảo cấu trúc nhất quán
 * 
 * ## Cấu trúc một module:
 * 
 * ```
 * src/modules/
 *    └── moduleName/
 *        ├── index.js          ← Entry point, export register function
 *        ├── controllers/
 *        ├── services/
 *        ├── models/
 *        ├── repositories/
 *        ├── routes/
 *        └── validation/
 * ```
 * 
 * ## Module Manifest:
 * 
 * ```javascript
 * {
 *   name: 'auth',           // Tên module
 *   basePath: '/',          // Base path cho routes
 *   routes: Router,         // Express router (single router)
 *   publicRoutes: Router,   // Routes không cần auth
 *   privateRoutes: Router,  // Routes cần auth
 *   publicApi: {...},       // Services export ra ngoài
 *   tasks: [fn1, fn2]       // Background tasks
 * }
 * ```
 * 
 * @module bootstrap/moduleLoader
 * 
 * =============================================================================
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Đường dẫn tới thư mục chứa các modules
 * @constant {string}
 */
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const modulesDir = path.resolve(currentDir, '..', 'modules');

/**
 * Kiểm tra file có tồn tại không
 * 
 * @async
 * @function fileExists
 * @param {string} filePath - Đường dẫn cần kiểm tra
 * @returns {Promise<boolean>} true nếu file tồn tại
 * @private
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Normalize module manifest về cấu trúc chuẩn
 * 
 * @function normalizeModuleManifest
 * @description
 * Đảm bảo manifest luôn có đầy đủ các fields cần thiết,
 * sử dụng giá trị mặc định nếu không được cung cấp.
 * 
 * @param {Object} input - Raw manifest từ module
 * @param {string} fallbackName - Tên mặc định (tên folder)
 * @returns {Object} Normalized manifest
 * 
 * @example
 * // Input
 * { routes: myRouter }
 * 
 * // Output
 * {
 *   name: 'moduleName',
 *   routes: myRouter,
 *   publicRoutes: null,
 *   privateRoutes: null,
 *   basePath: '/',
 *   publicApi: {},
 *   tasks: []
 * }
 */
function normalizeModuleManifest(input = {}, fallbackName) {
  const {
    name = fallbackName,        // Tên module, mặc định là tên folder
    routes = null,              // Single router
    publicRoutes = null,        // Routes công khai
    privateRoutes = null,       // Routes cần authentication
    basePath = '/',             // Base path để mount router
    publicApi = {},             // Services export ra ngoài
    tasks = [],                 // Background tasks/cron jobs
  } = input;

  return { name, routes, publicRoutes, privateRoutes, basePath, publicApi, tasks };
}

/**
 * Load tất cả modules từ thư mục modules
 * 
 * @async
 * @function loadModules
 * @description
 * Quét thư mục modules, tìm các folders chứa index.js,
 * import và gọi hàm register của mỗi module.
 * 
 * ## Quy trình:
 * 1. Đọc danh sách folders trong src/modules
 * 2. Với mỗi folder có index.js:
 *    - Dynamic import index.js
 *    - Gọi hàm register (default export)
 *    - Nhận về manifest
 * 3. Normalize và trả về array of manifests
 * 
 * @param {Container} container - DI Container để inject vào modules
 * @param {Object} [options={}] - Options
 * @param {string} [options.modulesPath] - Custom path tới thư mục modules
 * @returns {Promise<Array<Object>>} Array of normalized module manifests
 * 
 * @example
 * const manifests = await loadModules(container);
 * console.log(manifests);
 * // [{ name: 'auth', routes: ..., ... }, { name: 'users', ... }]
 */
export default async function loadModules(container, options = {}) {
  // Cho phép override đường dẫn modules (hữu ích cho testing)
  const directory = options.modulesPath ?? modulesDir;
  
  // Đọc danh sách entries trong thư mục
  let entries = [];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (err) {
    // Nếu thư mục không tồn tại, trả về array rỗng
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const manifests = [];

  // Duyệt qua từng entry
  for (const entry of entries) {
    // Chỉ xử lý directories
    if (!entry.isDirectory()) {
      continue;
    }
    
    const moduleRoot = path.join(directory, entry.name);
    const indexFile = path.join(moduleRoot, 'index.js');
    
    // Bỏ qua nếu không có index.js
    if (!(await fileExists(indexFile))) {
      continue;
    }

    try {
      // Dynamic import module
      // Chuyển đổi sang file URL để import hoạt động đúng trên mọi OS
      const moduleUrl = pathToFileURL(indexFile).href;
      const imported = await import(moduleUrl);
      
      // Lấy hàm register (default export hoặc named export 'register')
      const register = imported.default ?? imported.register;
      
      // Bỏ qua nếu không có hàm register
      if (typeof register !== 'function') {
        continue;
      }
      
      // Gọi hàm register với container
      // Module có thể đăng ký services/models vào container
      // và trả về manifest mô tả routes và public API
      const manifest = await register({ container });
      
      // Normalize và thêm vào danh sách
      manifests.push(normalizeModuleManifest(manifest, entry.name));
    } catch (err) {
      // Log lỗi nhưng không crash - cho phép app tiếp tục chạy
      // với các modules load thành công
      const logger = container.has('logger') ? container.get('logger') : console;
      logger.error({ module: entry.name, err }, 'Failed to load module');
    }
  }

  return manifests;
}
