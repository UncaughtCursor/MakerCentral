import CloudFn from '@data/util/CloudFn';
import React, { useState, useEffect } from 'react';

interface CloudFnState<Output> {
	state: 'Loading' | 'Loaded' | 'Error';
	value: Output | null;
}

/**
 * A hook that wraps a Cloud Function call in a React hook.
 * @param name The name of the Cloud Function.
 * @param input The input to the Cloud Function or null to not trigger the Cloud Function.
 * @returns The state of the Cloud Function, which includes the output.
 */
function useCloudFn<Input = void, Output = void>(
	name: string,
	input: Input | null,
): CloudFnState<Output> {
	const [state, setState] = useState<CloudFnState<Output>>({
		state: 'Loading',
		value: null,
	});

	useEffect(() => {
		if (input !== null) {
			CloudFn<Input, Output>(name, input).then((value) => {
				setState({
					state: 'Loaded',
					value: value.data.result,
				});
			}).catch((e) => {
				console.error(e);
				setState({
					state: 'Error',
					value: null,
				});
			});
		}
		if (state.state === 'Loaded') {
			setState({
				state: 'Loading',
				value: null,
			});
		}
	}, [name, JSON.stringify(input)]);

	if (input === null) {
		return {
			state: 'Loaded',
			value: null,
		};
	}

	return state;
}

export default useCloudFn;
