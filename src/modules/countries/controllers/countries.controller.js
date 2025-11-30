import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  CountryInputError,
  createCountry,
  deleteCountry,
  getCountryById,
  listCountries,
  searchCountriesByName,
  updateCountry,
} from '../services/countries.service.js';

function mapCountryError(error, fallbackMessage, fallbackCode) {
  if (error instanceof CountryInputError) {
    return new AppException(error.message, error.code ?? fallbackCode, error.statusCode ?? 400);
  }
  return toAppException(error, fallbackMessage, fallbackCode);
}

const CountriesController = {
  async list(req, res, next) {
    try {
      const payload = await listCountries({ page: req.query.page, limit: req.query.limit });
      return ApiResponse.success(res, payload, 'Countries retrieved');
    } catch (error) {
      next(mapCountryError(error, 'Error retrieving countries list', 'COUNTRIES_LIST_FAILED'));
    }
  },

  async search(req, res, next) {
    try {
      const payload = await searchCountriesByName({
        name: req.query.name,
        limit: req.query.limit,
        page: req.query.page,
      });
      return ApiResponse.success(res, payload, 'Countries search results');
    } catch (error) {
      next(mapCountryError(error, 'Error searching countries by name', 'COUNTRIES_SEARCH_FAILED'));
    }
  },

  async detail(req, res, next) {
    try {
      const country = await getCountryById(req.params.id);
      return ApiResponse.success(res, country, 'Country retrieved');
    } catch (error) {
      next(mapCountryError(error, 'Error retrieving country information', 'COUNTRY_FETCH_FAILED'));
    }
  },

  async create(req, res, next) {
    try {
      const country = await createCountry(req.body);
      return ApiResponse.created(res, country, 'Country created');
    } catch (error) {
      next(mapCountryError(error, 'Error creating country', 'COUNTRY_CREATE_FAILED'));
    }
  },

  async update(req, res, next) {
    try {
      const country = await updateCountry(req.params.id, req.body);
      return ApiResponse.success(res, country, 'Country updated');
    } catch (error) {
      next(mapCountryError(error, 'Error updating country', 'COUNTRY_UPDATE_FAILED'));
    }
  },

  async remove(req, res, next) {
    try {
      await deleteCountry(req.params.id);
      return ApiResponse.success(res, { id: Number.parseInt(req.params.id, 10) || req.params.id }, 'Country deleted');
    } catch (error) {
      next(mapCountryError(error, 'Error deleting country', 'COUNTRY_DELETE_FAILED'));
    }
  },
};

export default CountriesController;
