import MeiliSearch from 'meilisearch';
import MeiliCredentials from './data/private/meilisearch-credentials.json';

// SMM2 API constants

export const smm2APIBaseUrl = 'http://magic.makercentral.io';

export const maxDataIdEndpoint = 'newest_data_id';
export const levelEndpoint = 'level_info_multiple';
export const userEndpoint = 'user_info_multiple';
export const superWorldEndpoint = 'super_worlds';
export const thumbnailEndpoint = 'level_thumbnail';

// Meilisearch
export const meilisearch = new MeiliSearch(MeiliCredentials);

export const levelIndexName = 'levels';
export const userIndexName = 'users';
export const popularLevelIndexName = 'popular-levels';
export const superWorldIndexName = 'worlds';