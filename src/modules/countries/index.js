/**
 * @fileoverview Countries Module - Entry Point
 * Module đăng ký và cấu hình cho chức năng quản lý quốc gia trong hệ thống KickOffHub.
 * 
 * Module này chịu trách nhiệm:
 * - Đăng ký Model Country vào DI container
 * - Đăng ký Countries Service vào DI container
 * - Export các router công khai và riêng tư
 * - Cung cấp public API cho các module khác sử dụng
 * 
 * @module modules/countries
 * @requires ./routes/countries.routes.js
 * @requires ./models/country.model.js
 * @requires ./services/countries.service.js
 * @requires ../../contracts/tokens.js
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { publicRouter, privateRouter } from './routes/countries.routes.js';
import Country from './models/country.model.js';
import * as CountriesService from './services/countries.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Đăng ký Countries Module vào hệ thống.
 * Hàm này được gọi bởi module loader khi khởi động ứng dụng.
 * 
 * @async
 * @function registerCountriesModule
 * @param {Object} options - Tùy chọn cấu hình module
 * @param {Object} options.container - DI (Dependency Injection) container để đăng ký services và models
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Tên module ('countries')
 * @returns {string} returns.basePath - Đường dẫn gốc cho routes ('/')
 * @returns {Router} returns.publicRoutes - Express router cho các routes công khai (không cần auth)
 * @returns {Router} returns.privateRoutes - Express router cho các routes riêng tư (cần auth)
 * @returns {Object} returns.publicApi - API công khai để các module khác có thể import
 * 
 * @example
 * // Được gọi tự động bởi moduleLoader
 * const countriesModule = await registerCountriesModule({ container });
 * console.log(countriesModule.name); // 'countries'
 */
export default async function registerCountriesModule({ container }) {
  // Đăng ký Country Model vào container nếu chưa tồn tại
  registerIfMissing(container, TOKENS.models.Country, Country);
  
  // Đăng ký Countries Service vào container
  container.set(TOKENS.services.countries, CountriesService);

  // Trả về cấu hình module cho hệ thống
  return {
    name: 'countries',
    basePath: '/',
    publicRoutes: publicRouter,
    privateRoutes: privateRouter,
    // Public API cho phép các module khác truy cập Country model và services
    publicApi: {
      Country,
      services: CountriesService,
    },
  };
}
