/**
 * =============================================================================
 * FILE: src/lib/apiFootballClient.js
 * =============================================================================
 * 
 * @fileoverview API-Football Client Re-export Module
 * 
 * @description
 * Re-export API-Football service functions từ module.
 * Cung cấp convenient import path cho external usage.
 * 
 * ## Exported Functions:
 * - apiFootballGet: GET request tới API-Football
 * - apiFootballRequest: Generic request function
 * - apiFootballBreaker: Circuit breaker instance
 * 
 * @module lib/apiFootballClient
 * @see module:modules/apiFootball/services/apiFootball.service
 * 
 * @example
 * import { apiFootballGet } from './lib/apiFootballClient.js';
 * 
 * const leagues = await apiFootballGet('/leagues', { country: 'England' });
 * 
 * =============================================================================
 */

export {
  apiFootballGet,
  apiFootballRequest,
  apiFootballBreaker,
} from '../modules/apiFootball/services/apiFootball.service.js';
