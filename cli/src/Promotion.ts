import fs from 'fs/promises';
import { getDoc } from './SearchManager';
import MeiliPromoCredentials from '@data/private/meilisearch-promo-credentials.json';
import MeiliSearch from 'meilisearch';

export type PromotionFile = Record<string, CoursePromotion[]>;

export type CoursePromotion = {
	id: string,
	registrationTime: number,
	expiryTime: number | null,
};

const promoMeilisearch = new MeiliSearch(MeiliPromoCredentials);

/**
 * Loads the promotion file.
 * @returns The promotion file.
 */
export async function loadPromotions(): Promise<PromotionFile> {
	const file = await fs.readFile('data/promotions.json', 'utf-8');
	return JSON.parse(file);
}

/**
 * Saves the promotion file.
 * @param promotionFile The promotion file to save.
 */
export async function savePromotions(promotionFile: PromotionFile): Promise<void> {
	await fs.writeFile('data/promotions.json', JSON.stringify(promotionFile, null, 2));
}

/**
 * Registers a course promotion for a user.
 * @param name The name of the user.
 * @param courseIds A list of course IDs to register.
 * @param expires Whether the promotion expires.
 */
export async function registerPromotion(name: string, courseIds: string[], expires: boolean): Promise<void> {
	const promotionFile = await loadPromotions();
	const existingPromotions = promotionFile[name] || [];
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
	promotionFile[name] = [...existingPromotions, ...newPromotions];

	await savePromotions(promotionFile);
	console.log(`Registered ${courseIds.length} course promotion(s) for ${name}.`);
}

/**
 * Unregisters a course promotion for a user or course.
 * @param nameOrId The name of the user or the course ID.
 */
export async function unregisterPromotion(nameOrId: string): Promise<void> {
	const promotionFile = await loadPromotions();

	const formattedId = formatCourseId(nameOrId);

	const context = getIdentifierContext(nameOrId, promotionFile);

	// Check if the nameOrId is a user name.
	if (context === 'name') {
		delete promotionFile[nameOrId];
		console.log(`Unregistered all course promotions for ${nameOrId}.`);
	} else if (context === 'id') {
		// Check if the nameOrId is a course ID.
		const userNames = Object.keys(promotionFile);
		for (const userName of userNames) {
			const promotions = promotionFile[userName];
			const index = promotions.findIndex(promotion => promotion.id === formattedId);
			if (index !== -1) {
				promotions.splice(index, 1);
				console.log(`Unregistered course promotion for ${userName}.`);
			}
		}
	} else {
		throw new Error(`No course promotion found for ${nameOrId}.`);
	}

	await savePromotions(promotionFile);
}

/**
 * Unregisters any expired course promotions.
 */
export async function auditPromotions(): Promise<void> {
	const promotionFile = await loadPromotions();

	const userNames = Object.keys(promotionFile);
	for (const userName of userNames) {
		const promotions = promotionFile[userName];
		const expiredPromotions = promotions.filter(promotion => promotion.expiryTime !== null && promotion.expiryTime < Date.now());
		if (expiredPromotions.length > 0) {
			console.log(`Found ${expiredPromotions.length} expired course promotion(s) for ${userName}.`);
			for (const promotion of expiredPromotions) {
				const index = promotions.findIndex(p => p.id === promotion.id);
				promotions.splice(index, 1);
			}
		}
	}

	console.log('Finished auditing course promotions.');

	await savePromotions(promotionFile);
}

/**
 * Displays course promotions. The relevant promotions depend on the parameter.
 * @param nameOrId The name of the user or the course ID, or omit to display all promotions.
 */
export async function displayPromotions(nameOrId?: string): Promise<void> {
	const promotionFile = await loadPromotions();

	const context = nameOrId
		? getIdentifierContext(nameOrId || '', promotionFile)
		: 'displayAll';

	switch (context) {
		case 'name': {
			const promotions = promotionFile[nameOrId!];
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
			const userNames = Object.keys(promotionFile);
			for (const userName of userNames) {
				const promotions = promotionFile[userName];
				const promotion = promotions.find(promotion => promotion.id === nameOrId);
				if (promotion) {
					printPromotion(promotion);
					console.log(`Registered by: ${userName}`);
				}
			}
			break;
		}
		case 'displayAll': {
			const userNames = Object.keys(promotionFile);
			for (const userName of userNames) {
				console.log(`\n= Course promotions for ${userName} =`);
				const promotions = promotionFile[userName];
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