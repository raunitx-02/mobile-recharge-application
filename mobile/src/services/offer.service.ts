import API from './api';

export const offerService = {
  getOffers: () => API.get('/api/offers'),

  claimOffer: (offerId: string) =>
    API.post(`/api/offers/${offerId}/claim`),

  getReferralInfo: () => API.get('/api/offers/referral'),

  applyReferral: (code: string) =>
    API.post('/api/offers/referral/apply', { code }),

  getBanners: () => API.get('/api/offers/banners'),
};
