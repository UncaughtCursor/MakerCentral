import { useState, useEffect } from 'react';

// https://github.com/yocontra/react-responsive/issues/269#issuecomment-996821167

/**
 * Evaluates a media query.
 * @param query The query to evaluate.
 * @returns Whether or not the query is active.
 */
export default function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}
		const listener = () => {
			setMatches(media.matches);
		};
		media.addListener(listener);
		return () => media.removeListener(listener);
	}, [matches, query]);

	return matches;
}
