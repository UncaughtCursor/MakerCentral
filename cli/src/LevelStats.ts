/* eslint-disable import/prefer-default-export */
/* eslint-disable no-redeclare */
import fs from 'fs';
import natural from 'natural';
import { MCRawLevelDoc } from '@data/types/MCRawTypes';
import {
	levelOutDir, userOutDir,
} from './LevelConvert';
import {
	MCLevelDocData, MCLevelPreprocessData, MCUserDocData,
} from '../../data/types/MCBrowserTypes';
import TextDirStream from './TextDirStream';
import { loadJSON, printList } from './util/Util';

export const statsDir = 'out/stats';

/**
 * Loads the set of raw level documents.
 * WARNING: Won't work if the data is too big.
 * @returns A promise containing the loaded levels.
 */
export async function loadRawLevelDocs() {
	const fileNames = fs.readdirSync(levelOutDir);

	const levels: MCRawLevelDoc[] = [];

	fileNames.forEach((fileName) => {
		const batchLevels = loadJSON(`${levelOutDir}/${fileName}`) as MCRawLevelDoc[];
		batchLevels.forEach((level) => {
			levels.push(level);
		});
	});

	return levels;
}

/**
 * Loads the set of users levels.
 * @returns A promise containing the loaded levels.
 */
export async function loadUsers(): Promise<{[key: string]: MCUserDocData}> {
	const fileNames = fs.readdirSync(userOutDir);

	let users: {[key: string]: MCUserDocData} = {};

	fileNames.forEach((fileName) => {
		const batchUsers = loadJSON(`${userOutDir}/${fileName}`) as {[key: string]: MCUserDocData};
		users = {
			...users,
			...batchUsers,
		};
	});

	return users;
}

type WordCountData = {[word: string]: {
	numInstances: number;
} | undefined};

/**
 * Generates and saves a key phrase count for level titles.
 * @param levels The levels to generate phrases for.
 */
function generatePhraseCount(levels: MCLevelPreprocessData[]) {
	console.log('Running phrase count...');
	const wordData = {} as WordCountData;
	levels.forEach((level) => {
		// Get an array of all lowercase words and phrases in the titles of levels
		const wordString = level.name;

		const formattedWordString = wordString.toLowerCase()
			.replace(/['.,/#!$%^&*;:{}=\-_`~()[\]]/g, '');

		const keyPhrases = getKeyPhrases(formattedWordString);
		keyPhrases.forEach((word) => {
			const addEntry = (entry: string) => {
				if (wordData[entry] === undefined) {
					wordData[entry] = {
						numInstances: 1,
					};
				} else {
					wordData[entry]!.numInstances++;
				}
			};

			addEntry(word);
		});
	});

	const wordDataKeys = Object.keys(wordData);

	const filteredPhrases = wordDataKeys.filter((phrase, i) => {
		const minHits = 5;
		if (wordData[phrase]!.numInstances < minHits) return false;

		if (i % 10 === 0) console.log(`Phrase dedupe ${i} / ${wordDataKeys.length}`);

		let accepted = true;

		let otherPhraseIdx = i + 1;
		let doLoop = true;
		while (doLoop) {
			const otherPhrase = wordDataKeys[otherPhraseIdx];

			if (!otherPhrase.includes(phrase)
				|| otherPhraseIdx >= wordDataKeys.length) {
				doLoop = false;
			} else if (wordData[phrase]!.numInstances === wordData[otherPhrase]!.numInstances) {
				accepted = false;
				doLoop = false;
			}

			otherPhraseIdx++;
		}
		return accepted;
	}).map((key) => ({
		word: key,
		numInstances: wordData[key]!.numInstances,
	}));

	const rankedWords = filteredPhrases.filter(
		(wordEntry) => wordEntry.numInstances > 1,
	)
		.sort((a, b) => b.numInstances - a.numInstances);

	const outFileName = `${statsDir}/wordData.json`;
	fs.writeFileSync(outFileName, JSON.stringify(rankedWords));
	console.log(`Phrase stats written to ${outFileName}`);
}

interface Percentile {
	percentile: number,
	value: number,
}

/**
 * Given a set of levels and a property name,
 * generates a range of percentiles for that property.
 * @param levels The levels to process.
 * @param numericalProperty The property.
 * @param numDataPoints The number of data points to create.
 */
function getPercentilesForLevelValues(
	levels: MCLevelPreprocessData[],
	numericalProperty: keyof MCLevelPreprocessData,
	numDataPoints: number,
): Percentile[];

/**
 * Given a set of levels and an evaluation function for each level,
 * generates a range of percentiles for those evaluations.
 * @param levels The levels to process.
 * @param fn The evaluation function.
 * @param numDataPoints The number of data points to create.
 */
function getPercentilesForLevelValues(
	levels: MCLevelPreprocessData[],
	fn: (arg0: MCLevelPreprocessData) => number,
	numDataPoints: number,
): Percentile[];

/**
 * Given a set of levels and a property name,
 * generates a range of percentiles for that property.
 */
function getPercentilesForLevelValues(
	levels: MCLevelPreprocessData[],
	numericalPropertyOrFn: keyof MCLevelPreprocessData
		| ((arg0: MCLevelPreprocessData) => number),
	numDataPoints: number,
) {
	const sortedValues = levels.map((level) => (typeof numericalPropertyOrFn === 'string'
		? level[numericalPropertyOrFn] as number
		: numericalPropertyOrFn(level))).sort((a, b) => a - b);

	const percentiles: Percentile[] = [];

	for (let i = 0; i < numDataPoints; i++) {
		const percentile = i / (numDataPoints - 1);
		const percentileIndexNumber = Math.min(
			Math.round(sortedValues.length * percentile),
			sortedValues.length - 1,
		);
		percentiles.push({
			percentile,
			value: sortedValues[percentileIndexNumber],
		});
	}

	return percentiles;
}

/**
 * Given a string, extracts contentful phrases from it.
 * @param str The string to extract from.
 * @returns The contentful phrases.
 */
function getKeyPhrases(str: string): string[] {
	const ngrams: string[][] = (() => {
		const result = [];
		const numWords = str.split(' ').length;

		for (let i = 0; i < numWords; i++) {
			const theseNgrams = natural.NGrams.ngrams(str, i + 1);
			result.push(...theseNgrams);
		}

		return result;
	})();

	const language = 'EN';
	const defaultCategory = 'N';
	const partOfSpeechTagger = new natural.BrillPOSTagger(
		new natural.Lexicon(language, defaultCategory),
		new natural.RuleSet('EN'),
	);

	const keyPhrases: string[] = (() => {
		const partsOfSpeechTaggedNgrams = ngrams.map((ngram) => {
			const taggerOutput = partOfSpeechTagger.tag(ngram);

			return taggerOutput.taggedWords;
		});

		const keyNgrams = partsOfSpeechTaggedNgrams.filter(
			(ngram) => isContentfulWord(ngram[0]) && isContentfulWord(ngram[ngram.length - 1]),
		);

		return keyNgrams.map((ngram) => ngram.map((taggedWord) => taggedWord.token).join(' '));
	})();

	return [...new Set(keyPhrases)];
}

/**
 * Determines if a tagged word is deemed to be significant enough to include in key phrases.
 * @param word The word to determine the contentful-ness of.
 * @returns Whether or not the word is deemed contentful.
 */
function isContentfulWord(word: natural.TaggedWord): boolean {
	const contentfulTags = [
		'CD',
		'JJ',
		'JJR',
		'JJS',
		'N',
		'NN',
		'NNP',
		'NNPS',
		'NNS',
		'UH',
		'VB',
		'VBD',
		'VBG',
		'VBN',
		'VBP',
		'VBZ',
	];

	const hasContentfulTags = contentfulTags.includes(word.tag);
	const isNotIs = natural.PorterStemmer.stem(word.token) !== 'is';

	return hasContentfulTags && isNotIs;
}
