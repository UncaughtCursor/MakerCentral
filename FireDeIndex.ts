import fs from 'fs';
import { InterfaceDeclaration, TypescriptParser } from 'typescript-parser';
import config from './fire-deindex.json';

// RUN USING:
// npx ts-node --project ./node.tsconfig.json FireDeIndex.ts

interface FireDeIndexConfig {
	defaultConfig: FirebaseIndexConfig;
	deIndex: FireDeIndexEntry;
}

interface FireDeIndexEntry {
	collectionId: string;
	sourceFile: string;
	interfaceName: string;
	whitelistedProperties: string[];
}

interface FirebaseIndexConfig {
	indexes: FirebaseCompoundIndex[];
	fieldOverrides?: FirebaseFieldOverride[];
}

interface FirebaseCompoundIndex {
	collectionGroup: string;
	queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
	fields: FirebaseField[];
}

interface FirebaseField {
	fieldPath: string;
    order?: 'ASCENDING' | 'DESCENDING';
    arrayConfig?: 'CONTAINS';
}

interface FirebaseFieldOverride {
	collectionGroup: string;
	fieldPath: string;
	indexes: FirebaseIndex[];
}

interface FirebaseIndex {
    queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
    order?: string;
    arrayConfig?: 'CONTAINS';
}

const firebaseConfigPath = 'firestore.indexes.json';

runMain();

/**
 * The main function.
 */
async function runMain() {
	const firebaseConfig = await generateFirebaseIndexConfig();
	fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
}

/**
 * Generates a Firebase index config from the de-index config.
 * @returns The Firebase index config.
 */
async function generateFirebaseIndexConfig(): Promise<FirebaseIndexConfig> {
	const generatedFieldOverrides: FirebaseFieldOverride[] = [];
	for (const deIndex of config.deIndex) {
		generatedFieldOverrides.push(...(await generateFieldOverridesForInterface(deIndex)));
	}
	return {
		indexes: config.defaultConfig.indexes as FirebaseCompoundIndex[],
		fieldOverrides: [...generatedFieldOverrides,
			...(config.defaultConfig.fieldOverrides || [])] as FirebaseFieldOverride[],
	};
}

/**
 * Generates a list of field overrides for a given de-index entry.
 * @param deIndex The de-index entry.
 * @returns The list of field overrides.
 */
async function generateFieldOverridesForInterface(
	deIndex: FireDeIndexEntry,
): Promise<FirebaseFieldOverride[]> {
	const overrides: FirebaseFieldOverride[] = [];
	const parser = new TypescriptParser();
	const parsed = await parser.parseFile(deIndex.sourceFile, 'workspace root');
	const interfaceNode = parsed.declarations.find((d) => d.name === deIndex.interfaceName);
	if (!interfaceNode) {
		throw new Error(`Could not find interface ${deIndex.interfaceName} in ${deIndex.sourceFile}`);
	}
	if (!(interfaceNode instanceof InterfaceDeclaration)) {
		throw new Error(`Interface ${deIndex.interfaceName} in ${deIndex.sourceFile} is not an interface`);
	}
	for (const property of interfaceNode.properties) {
		if (deIndex.whitelistedProperties.includes(property.name)) {
			continue;
		}
		overrides.push({
			collectionGroup: deIndex.collectionId,
			fieldPath: property.name,
			indexes: [], // Disables all indexing for this field
		});
	}
	return overrides;
}
