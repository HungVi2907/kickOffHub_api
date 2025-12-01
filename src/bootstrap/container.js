/**
 * =============================================================================
 * FILE: src/bootstrap/container.js
 * =============================================================================
 * 
 * @fileoverview Dependency Injection Container cho Kick Off Hub API
 * 
 * @description
 * File này implement một DI (Dependency Injection) Container đơn giản nhưng hiệu quả.
 * Container cho phép quản lý dependencies một cách tập trung, giúp:
 * - Loose coupling giữa các modules
 * - Dễ dàng testing với mock dependencies
 * - Quản lý lifecycle của services
 * 
 * ## Pattern được sử dụng: Service Locator / IoC Container
 * 
 * ```
 * Container Registry (Map)
 *    ├── 'sequelize'    → Sequelize instance
 *    ├── 'redis'        → Redis client
 *    ├── 'logger'       → Pino logger
 *    ├── 'models.User'  → User model
 *    ├── 'services.auth' → Auth service
 *    └── ...
 * ```
 * 
 * ## Cách sử dụng:
 * 
 * ```javascript
 * // Tạo container
 * const container = createContainer();
 * 
 * // Đăng ký dependency
 * container.set('myService', new MyService());
 * 
 * // Lấy dependency
 * const service = container.get('myService');
 * 
 * // Lazy resolve với factory function
 * const db = container.resolve('db', () => new Database());
 * ```
 * 
 * @module bootstrap/container
 * 
 * =============================================================================
 */

/**
 * Dependency Injection Container class
 * 
 * @class Container
 * @description
 * Container lưu trữ và cung cấp dependencies thông qua token-based lookup.
 * Sử dụng Map để lưu trữ, đảm bảo O(1) lookup time.
 * 
 * @example
 * const container = new Container();
 * container.set('database', sequelizeInstance);
 * const db = container.get('database');
 */
class Container {
  /**
   * Khởi tạo Container với registry rỗng
   * @constructor
   */
  constructor() {
    /**
     * Registry lưu trữ tất cả dependencies
     * @type {Map<string, any>}
     * @private
     */
    this.registry = new Map();
  }

  /**
   * Đăng ký một dependency vào container
   * 
   * @method set
   * @param {string} token - Unique identifier cho dependency (ví dụ: 'models.User')
   * @param {any} value - Giá trị/instance của dependency
   * @returns {any} Giá trị vừa được đăng ký
   * @throws {Error} Nếu token không được cung cấp
   * 
   * @example
   * container.set('services.auth', authService);
   */
  set(token, value) {
    if (!token) {
      throw new Error('Container token is required');
    }
    this.registry.set(token, value);
    return value;
  }

  /**
   * Kiểm tra dependency đã được đăng ký chưa
   * 
   * @method has
   * @param {string} token - Token cần kiểm tra
   * @returns {boolean} true nếu đã đăng ký, false nếu chưa
   * 
   * @example
   * if (container.has('models.User')) {
   *   const User = container.get('models.User');
   * }
   */
  has(token) {
    return this.registry.has(token);
  }

  /**
   * Lấy dependency từ container
   * 
   * @method get
   * @param {string} token - Token của dependency cần lấy
   * @returns {any} Giá trị của dependency
   * @throws {Error} Nếu dependency chưa được đăng ký
   * 
   * @example
   * const authService = container.get('services.auth');
   */
  get(token) {
    if (!this.registry.has(token)) {
      throw new Error(`Dependency '${token}' has not been registered in the container.`);
    }
    return this.registry.get(token);
  }

  /**
   * Resolve dependency với lazy initialization
   * 
   * @method resolve
   * @description
   * Nếu dependency đã tồn tại, trả về ngay.
   * Nếu chưa, gọi factory function để tạo và cache kết quả.
   * Pattern này hữu ích cho lazy loading và circular dependency.
   * 
   * @param {string} token - Token của dependency
   * @param {Function} [factory] - Factory function để tạo dependency nếu chưa tồn tại
   * @returns {any} Giá trị của dependency
   * @throws {Error} Nếu dependency không tồn tại và không có factory
   * 
   * @example
   * // Lazy create database connection
   * const db = container.resolve('database', () => new Database());
   */
  resolve(token, factory) {
    // Nếu đã có trong registry, trả về ngay
    if (this.registry.has(token)) {
      return this.registry.get(token);
    }
    
    // Nếu không có factory, throw error
    if (typeof factory !== 'function') {
      throw new Error(`Dependency '${token}' is missing and no factory was provided.`);
    }
    
    // Gọi factory để tạo dependency, truyền container vào để factory có thể resolve dependencies khác
    const value = factory(this);
    
    // Cache kết quả vào registry
    this.registry.set(token, value);
    return value;
  }
}

/**
 * Factory function để tạo Container instance mới
 * 
 * @function createContainer
 * @returns {Container} Container instance mới
 * 
 * @example
 * const container = createContainer();
 */
export function createContainer() {
  return new Container();
}

export default createContainer;
