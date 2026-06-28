import client from './client';

export const getBadges = () => client.get('/api/badges').then(r => r.data);
export const getUserBadges = (params) => client.get('/api/user-badges', { params }).then(r => r.data);
export const getChallenges = () => client.get('/api/challenges').then(r => r.data);
