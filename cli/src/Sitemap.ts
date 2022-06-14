import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import * as fs from 'fs';
import { printList } from './Util';
import { db } from './FirebaseUtil';

const domain = 'https://musiclevelstudio.com';

const normalUrlStubs = [
	'/',
	'/levels',
	'/music-level-studio',
	'/news',
	'/about',
];

export async function generateSitemap() {
	console.log('Getting levels...\n');
	try {
		const levels = (await db.collection('/levels').get()).docs;

		const normalUrls = normalUrlStubs.map((stub) => `${domain}${stub}`);
		const levelUrls = levels.map((levelDoc) => `${domain}/levels/view/${levelDoc.id}`);
		console.log(`\n${levels.length} levels found.\n`);

		const urls = normalUrls.concat(levelUrls);
		printList(urls);

		console.log('Generating XML...');
		const xml = await generateXMLSitemap(urls);
		console.log(xml);

		console.log('\nWriting file...');
		fs.writeFileSync('out/sitemap.xml', xml);
	} catch (e) {
		console.error('An error occurred.');
		console.error(e);
	}
}

async function generateXMLSitemap(urls: string[]) {
	  // An array with your links
	  const links = urls.map((url) => ({
		url,
		changefreq: 'daily',
		priority: 0.5,
	}));

	  // Create a stream to write to
	  const stream = new SitemapStream();

	  // Return a promise that resolves with your XML string
	  return streamToPromise(Readable.from(links).pipe(stream)).then((data) => data.toString());
}
