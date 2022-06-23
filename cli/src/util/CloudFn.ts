import axios from 'axios'
import FirebaseCredentials from '@data/private/firebase-api-key.json';

const firebaseProjectName = 'music-level-studio-dev';
const apiKey = FirebaseCredentials.apiKey;

export default async function CloudFn<Input, Output>(name: string, input: Input): Promise<{
	data: Output
} | null>{
	const url = `https://us-central1-${firebaseProjectName}.cloudfunctions.net/${name}?key=${apiKey}`;
	try {
		const resp = await axios.post(url, {
			data: input,
		}, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return {
			data: resp.data as Output,
		}
	}
	catch(e) {
		console.error(e);
		return null;
	}
}