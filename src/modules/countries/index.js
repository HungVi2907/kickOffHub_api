import { publicRouter, privateRouter } from './routes/countries.routes.js';
import Country from './models/country.model.js';
import * as CountriesService from './services/countries.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

export default async function registerCountriesModule({ container }) {
  registerIfMissing(container, TOKENS.models.Country, Country);
  container.set(TOKENS.services.countries, CountriesService);

  return {
    name: 'countries',
    basePath: '/',
    publicRoutes: publicRouter,
    privateRoutes: privateRouter,
    publicApi: {
      Country,
      services: CountriesService,
    },
  };
}
