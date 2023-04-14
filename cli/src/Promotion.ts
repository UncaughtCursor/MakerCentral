import fs from 'fs/promises';
import { getDoc } from './SearchManager';
import MeiliPromoCredentials from '@data/private/meilisearch-promo-credentials.json';
import MeiliSearch from 'meilisearch';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';

export type PromotionFile = Record<string, CoursePromotion[]>;

export type CoursePromotion = {
	id: string,
	registrationTime: number,
	expiryTime: number | null,
};

type CoursePromotionOperation = {
	type: 'register',
	name: string,
	courseId: string,
	expiryTime: number | null,
} | {
	type: 'unregister',
	name: string,
	courseId: string,
};

const promoMeilisearch = new MeiliSearch(MeiliPromoCredentials);
const promoIndex = promoMeilisearch.index('promo-levels');

let promotionsData: PromotionFile | null = null;
const pendingOperations: CoursePromotionOperation[] = [];

namespace CoursePromotionManager {
	/**
	 * Loads the promotion file.
	 * @returns The promotion file.
	 */
	export async function init(): Promise<void> {
		if (promotionsData) return;

		const file = await fs.readFile('data/promotions.json', 'utf-8');
		promotionsData = JSON.parse(file);
	}

	/**
	 * Commits pending operations to the promotion file and search index.
	 */
	export async function commit(): Promise<void> {
		if (promotionsData === null) throw new Error('Promotion manager not initialized.');

		console.log(JSON.stringify(pendingOperations, null, 2));

		if (pendingOperations.length === 0) return;

		const registerOperations = pendingOperations.filter(operation => operation.type === 'register');
		const unregisterOperations = pendingOperations.filter(operation => operation.type === 'unregister');

		const docsToAdd = await Promise.all(registerOperations.map(async operation => {
			return getDoc(operation.courseId, 'levels');
		}));
		await promoIndex.addDocuments(docsToAdd);

		const docIdsToRemove = unregisterOperations.map(operation => operation.courseId);
		await promoIndex.deleteDocuments(docIdsToRemove);

		while (pendingOperations.length > 0) {
			const operation = pendingOperations.shift();
			if (operation) {
				switch (operation.type) {
					case 'register': {
						promotionsData[operation.name] = [...(promotionsData[operation.name] || []), {
							id: operation.courseId,
							registrationTime: Date.now(),
							expiryTime: operation.expiryTime,
						}];
						break;
					}
					case 'unregister': {
						promotionsData[operation.name] = (promotionsData[operation.name] || []).filter(promotion => promotion.id !== operation.courseId);
						break;
					}
				}
			}
		}

		// Clear empty user entries.
		for (const name of Object.keys(promotionsData)) {
			if (promotionsData[name].length === 0) delete promotionsData[name];
		}

		await savePromotions();

		console.log('Promotions committed.');
	}

	/**
	 * Registers a course promotion for a user.
	 * @param name The name of the user.
	 * @param courseIds A list of course IDs to register.
	 * @param expires Whether the promotion expires.
	 */
	export async function register(name: string, courseIds: string[], expires: boolean): Promise<void> {
		if (promotionsData === null) throw new Error('Promotion manager not initialized.');
		
		const existingPromotions = promotionsData[name] || [];
		const formattedCourseIds = courseIds.map(formatCourseId);

		// Delete any existing promotions for the same course IDs.
		for (const courseId of formattedCourseIds) {
			const index = existingPromotions.findIndex(promotion => promotion.id === courseId);
			if (index !== -1) existingPromotions.splice(index, 1);
		}

		const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
		const now = Date.now();
		const expiryTime = expires ? now + thirtyDaysMs : null;
		
		// Validate that the course IDs are valid.
		const results = await Promise.all(formattedCourseIds.map(id => getDoc(id, 'levels')));
		console.log(results);

		const newPromotions = formattedCourseIds.map(id => ({ id, registrationTime: now, expiryTime }));
		const operations = newPromotions.map(promotion => ({
			type: 'register' as const,
			name,
			courseId: promotion.id,
			expiryTime: promotion.expiryTime,
		}));

		pendingOperations.push(...operations);
		console.log(`Registered ${courseIds.length} course promotion(s) for ${name}.`);
	}

	/**
	 * Unregisters a course promotion for a user or course.
	 * @param nameOrId The name of the user or the course ID.
	 */
	export async function unregister(nameOrId: string): Promise<void> {
		if (promotionsData === null) throw new Error('Promotion manager not initialized.');

		const formattedId = formatCourseId(nameOrId);

		const context = getIdentifierContext(nameOrId, promotionsData);

		// Check if the nameOrId is a user name.
		if (context === 'name') {
			// Generate delete operations for all course promotions for the user.
			const promotions = promotionsData[nameOrId];
			const operations = promotions.map(promotion => ({
				type: 'unregister' as const,
				name: nameOrId,
				courseId: promotion.id,
			}));

			pendingOperations.push(...operations);

			console.log(`Unregistered all course promotions for ${nameOrId}.`);
		} else if (context === 'id') {
			// Check if the nameOrId is a course ID.
			const userNames = Object.keys(promotionsData);
			for (const userName of userNames) {
				const promotions = promotionsData[userName];
				const index = promotions.findIndex(promotion => promotion.id === formattedId);
				if (index !== -1) {
					const operation: CoursePromotionOperation = {
						type: 'unregister',
						name: userName,
						courseId: formattedId,
					};
					pendingOperations.push(operation);

					console.log(`Unregistered course promotion for ${userName}.`);
				}
			}
		} else {
			throw new Error(`No course promotion found for ${nameOrId}.`);
		}
	}

	/**
	 * Unregisters any expired course promotions.
	 */
	export async function audit(): Promise<void> {
		if (promotionsData === null) throw new Error('Promotion manager not initialized.');

		const userNames = Object.keys(promotionsData);
		for (const userName of userNames) {
			const promotions = promotionsData[userName];
			const expiredPromotions = promotions.filter(promotion => promotion.expiryTime !== null && promotion.expiryTime < Date.now());
			if (expiredPromotions.length > 0) {
				console.log(`Found ${expiredPromotions.length} expired course promotion(s) for ${userName}.`);
				for (const promotion of expiredPromotions) {
					const operation: CoursePromotionOperation = {
						type: 'unregister',
						name: userName,
						courseId: promotion.id,
					};
					pendingOperations.push(operation);
				}
			}
		}

		console.log('Finished auditing course promotions.');
	}

	/**
	 * Displays course promotions. The relevant promotions depend on the parameter.
	 * @param nameOrId The name of the user or the course ID, or omit to display all promotions.
	 */
	export async function view(nameOrId?: string): Promise<void> {
		if (promotionsData === null) throw new Error('Promotion manager not initialized.');

		const context = nameOrId
			? getIdentifierContext(nameOrId || '', promotionsData)
			: 'displayAll';

		switch (context) {
			case 'name': {
				const promotions = promotionsData[nameOrId!];
				if (promotions.length === 0) {
					console.log(`${nameOrId} has no course promotions.`);
				}
				console.log(`= Course promotions for ${nameOrId} =`);
				for (const promotion of promotions) {
					printPromotion(promotion);
					console.log('====================');
				}
				break;
			}
			case 'id': {
				// We want the name of the user who registered the promotion.
				const userNames = Object.keys(promotionsData);
				for (const userName of userNames) {
					const promotions = promotionsData[userName];
					const promotion = promotions.find(promotion => promotion.id === nameOrId);
					if (promotion) {
						printPromotion(promotion);
						console.log(`Registered by: ${userName}`);
					}
				}
				break;
			}
			case 'displayAll': {
				const userNames = Object.keys(promotionsData);
				for (const userName of userNames) {
					console.log(`\n= Course promotions for ${userName} =`);
					const promotions = promotionsData[userName];
					for (const promotion of promotions) {
						printPromotion(promotion);
						console.log(`Registered by: ${userName}`);
						console.log('====================');
					}
				}
				break;
			}
			case 'none': {
				console.log(`No course promotion found for ${nameOrId}.`);
			}
		}
	}

	/**
	 * Performs a basic word search for promoted courses.
	 * @param query The query to search for.
	 * @returns The promoted courses that match the query.
	 */
	export function search(query: string) {
		return promoIndex.search(query);
	}
}

export default CoursePromotionManager;

/**
 * Saves the promotion file.
 */
async function savePromotions(): Promise<void> {
	await fs.writeFile('data/promotions.json', JSON.stringify(promotionsData, null, 2));
}

/**
 * Returns if a string is a name, course ID, or neither.
 * @param nameOrId The string to check.
 * @param promotionFile The promotion file.
 * @returns 'name' if the string is a name, 'id' if the string is a course ID, or 'none' if the string is neither.
 */
function getIdentifierContext(nameOrId: string, promotionFile: PromotionFile): 'name' | 'id' | 'none' {
	const formattedId = formatCourseId(nameOrId);
	const userNames = Object.keys(promotionFile);
	if (userNames.includes(nameOrId)) return 'name';
	for (const userName of userNames) {
		const promotions = promotionFile[userName];
		if (promotions.some(promotion => promotion.id === formattedId)) return 'id';
	}
	return 'none';
}

/**
 * Formats a course ID.
 * @param id The course ID to format.
 * @returns The formatted course ID.
 */
function formatCourseId(id: string): string {
	return id.replace(/-/g, '').toUpperCase();
}

/**
 * Prints a promotion to the console.
 * @param promotion The promotion to print.
 */
function printPromotion(promotion: CoursePromotion) {
	console.log(`Course ID: ${promotion.id}`);
	console.log(`Registration time: ${new Date(promotion.registrationTime).toLocaleString()}`);
	console.log(`Expiry time: ${promotion.expiryTime ? new Date(promotion.expiryTime).toLocaleString() : 'Never'}`);
}

/**
 * Sets the index settings. Use when they get reset.
 * WARNING: Make sure no indexing is happening while this is running.
 */
export async function setPromoSearchSettings() {
	const searchResultLimit = 100000000;

	const levelIndex = promoMeilisearch.index('promo-levels');

	console.log('Setting settings...');

	const levelSearchableAttributes: (keyof MCLevelDocData)[] = [
		'name',
		'description',
	];
	const levelFilterableAttributes: (keyof MCLevelDocData)[] = [
		'uploadTime',
		'updatedTime',
		'makerName',
		'country',
		'makerId',
		'difficulty',
		'gameStyle',
		'theme',
		'numLikes',
		'numPlays',
		'likePercentage',
		'clearRate',
		'tags',
	];
	const levelSortableAttributes: (keyof MCLevelDocData)[] = [
		'uploadTime',
		'difficulty',
		'gameStyle',
		'theme',
		'numLikes',
		'numPlays',
		'likePercentage',
		'clearRate',
	];
	const levelRankingRules = [
		'words',
		'typo',
		'sort',
		'numLikes:desc',
		'likeToPlayRatio:desc',
		'attribute',
		'proximity',
		'exactness',
	];

	console.log(await levelIndex.updateSearchableAttributes(levelSearchableAttributes));
	console.log(await levelIndex.updateFilterableAttributes(levelFilterableAttributes));
	console.log(await levelIndex.updateSortableAttributes(levelSortableAttributes));
	console.log(await levelIndex.updateRankingRules(levelRankingRules));
	console.log(await levelIndex.updatePagination({
		maxTotalHits: searchResultLimit,
	}));

	console.log('Settings set.');
}