/**
 * =============================================================================
 * FILE: src/pipelines/httpRouter.js
 * =============================================================================
 * 
 * @fileoverview HTTP Router Builder cho Module-based Routing
 * 
 * @description
 * File này build một Express Router tổng hợp từ các module manifests.
 * Nó cho phép mỗi module định nghĩa routes riêng và tự động merge
 * vào router chính của application.
 * 
 * ## Routing Strategy:
 * 
 * Mỗi module có thể export routes theo 2 cách:
 * 
 * ### 1. Single Router (routes)
 * ```javascript
 * return {
 *   routes: myRouter,
 *   basePath: '/auth'
 * };
 * // Kết quả: /auth/* → myRouter
 * ```
 * 
 * ### 2. Public/Private Split (publicRoutes + privateRoutes)
 * ```javascript
 * return {
 *   publicRoutes: publicRouter,   // Không cần auth
 *   privateRoutes: privateRouter, // Cần auth middleware
 *   basePath: '/posts'
 * };
 * // Kết quả: /posts/* → publicRouter, /posts/* → privateRouter
 * ```
 * 
 * ## Flow:
 * ```
 * Module Manifests → buildHttpRouter → Combined Router → app.use('/api', router)
 * ```
 * 
 * @module pipelines/httpRouter
 * @requires express
 * 
 * =============================================================================
 */

import { Router } from 'express';

/**
 * Build HTTP router từ array of module manifests
 * 
 * @function buildHttpRouter
 * @description
 * Tạo một Express Router tổng hợp bằng cách mount routes từ mỗi module
 * vào basePath tương ứng.
 * 
 * ## Xử lý Priority:
 * 1. Nếu module có publicRoutes/privateRoutes → mount cả 2
 * 2. Nếu chỉ có routes → mount single router
 * 3. Nếu không có routes nào → skip module
 * 
 * @param {Array<ModuleManifest>} modules - Array of module manifests
 * @returns {Router} Express Router đã được cấu hình
 * 
 * @example
 * const manifests = [
 *   { name: 'auth', basePath: '/', routes: authRouter },
 *   { name: 'posts', basePath: '/', publicRoutes: postsPublic, privateRoutes: postsPrivate }
 * ];
 * const router = buildHttpRouter(manifests);
 * app.use('/api', router);
 */
export default function buildHttpRouter(modules = []) {
  // Tạo router chính
  const router = Router();

  modules
    // Lọc bỏ các manifest null/undefined
    .filter(Boolean)
    // Mount routes từ mỗi module
    .forEach((manifest) => {
      // Lấy base path, mặc định là '/'
      const mountPath = manifest.basePath || '/';
      
      // Kiểm tra xem module có split public/private routes không
      const hasScopedRoutes = manifest.publicRoutes || manifest.privateRoutes;

      if (hasScopedRoutes) {
        // === Strategy 1: Public + Private Routes ===
        // Cho phép module tách routes công khai (không cần auth)
        // và routes riêng tư (cần auth middleware)
        
        if (manifest.publicRoutes) {
          // Mount public routes (ví dụ: GET /posts, GET /posts/:id)
          router.use(mountPath, manifest.publicRoutes);
        }

        if (manifest.privateRoutes) {
          // Mount private routes (ví dụ: POST /posts, DELETE /posts/:id)
          // Note: Auth middleware được apply trong module routes, không phải ở đây
          router.use(mountPath, manifest.privateRoutes);
        }
        return;
      }

      // === Strategy 2: Single Router ===
      // Module sử dụng một router duy nhất cho tất cả routes
      if (manifest.routes) {
        router.use(mountPath, manifest.routes);
      }
    });

  return router;
}
