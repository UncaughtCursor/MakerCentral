import MeiliSearch from 'meilisearch';
import MeiliCredentials from './data/private/meilisearch-credentials.json';

// SMM2 API constants

export const smm2APIBaseUrl = 'https://tgrcode.com/mm2';

export const maxDataIdEndpoint = 'newest_data_id';
export const levelEndpoint = 'level_info_multiple_dataid';
export const userEndpoint = 'user_info_multiple';
export const superWorldEndpoint = 'super_world_multiple';
export const thumbnailEndpoint = 'level_thumbnail';
export const cacheDisableSuffix = '?noCaching=1';

// Meilisearch
export const meilisearch = new MeiliSearch(MeiliCredentials);

export const levelIndexName = 'levels';
export const userIndexName = 'users';
export const popularLevelIndexName = 'popular-levels';
export const superWorldIndexName = 'worlds';