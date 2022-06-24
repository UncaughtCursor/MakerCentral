import axios from 'axios';
import FirebaseCredentials from '../private/firebase-api-key.json';

const firebaseProjectName = 'music-level-studio-dev';
const apiKey = FirebaseCredentials.apiKey;

/**
 * Executes a Firebase cloud function.
 * @param name The name of the function.
 * @param input The input to the function.
 * @returns A promise that resolves to the output of the function or rejects with an error.
 */
export default async function CloudFn<Input, Output>(name: string, input: Input): Promise<{
	data: {
		result: Output,
	}
}> {
	const url = `https://us-central1-${firebaseProjectName}.cloudfunctions.net/${name}?key=${apiKey}`;
	const resp = await axios.post(url, {
		data: input,
	}, {
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return {
		data: resp.data as {
			result: Output
		},
	};
}
