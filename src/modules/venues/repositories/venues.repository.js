import Venue from '../models/venue.model.js';

const VENUE_ATTRIBUTES = ['id', 'name', 'address', 'city', 'capacity', 'surface', 'image'];

export function findAllVenues() {
  return Venue.findAll({ attributes: VENUE_ATTRIBUTES });
}

export function findVenueById(id) {
  return Venue.findByPk(id, { attributes: VENUE_ATTRIBUTES });
}

export function createVenueRecord(payload) {
  return Venue.create(payload);
}

export function updateVenueRecord(id, payload) {
  return Venue.update(payload, { where: { id } });
}

export function deleteVenueRecord(id) {
  return Venue.destroy({ where: { id } });
}

export function bulkUpsertVenues(payloads) {
  return Venue.bulkCreate(payloads, {
    updateOnDuplicate: ['name', 'address', 'city', 'capacity', 'surface', 'image'],
  });
}
