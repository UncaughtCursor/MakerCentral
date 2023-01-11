import { getDoc, basicSearch } from "./SearchManager";

export interface SearchTest {
	label: string;
	query: string;
}

interface SearchTestOptions {
	isId?: boolean;
	onlyLogFailures?: boolean;
}

export async function runSearchTests(
	tests: SearchTest[],
	options: SearchTestOptions = {},
) {
	for (const test of tests) {
		const res = !options.isId
			? await basicSearch(test.query, 'levels')
			: await hasDoc(test.query, 'levels');
		if (options.onlyLogFailures) {
			if (typeof res === 'boolean' ? !res : res.nbHits === 0) {
				console.log(`${test.label} failed`);	
			}
		} else {
			console.log(`${test.label}`);
			console.log(`${test.query}`);
			if (typeof res !== 'boolean') console.log(`${res.nbHits} results\n`);
			else console.log(res ? 'Found' : 'Not found');
		}
	}
}

async function hasDoc(id: string, indexName: string) {
	try {
		await getDoc(id, indexName);
		return true;
	}
	catch (err) {
		return false;
	}
}