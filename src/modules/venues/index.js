import router from './routes/venues.routes.js';
import Venue from './models/venue.model.js';
import * as VenuesService from './services/venues.service.js';

export default async function registerVenuesModule({ container }) {
  if (container && typeof container.set === 'function') {
    container.set('models.Venue', Venue);
    container.set('services.venues', VenuesService);
  }

  return {
    name: 'venues',
    basePath: '/',
    routes: router,
    publicApi: {
      Venue,
      services: VenuesService,
    },
  };
}
