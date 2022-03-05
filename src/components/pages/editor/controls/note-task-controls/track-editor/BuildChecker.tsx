import React from 'react';
import CheckCircleOutlineIcon from 'material-ui-icons/CheckCircleOutline';
import AddCircleOutlineIcon from 'material-ui-icons/AddCircleOutline';
import { LevelBuildCheck, LevelBuildCheckResult } from '@scripts/builder/optimization/LevelBuildChecks';

// TODO: Execute results in editor and feed results here

/**
 * A component that displays the status of pre-build checks to the user.
 * @param props The props:
 * * checks: An array of LevelBuildChecks to display the results for.
 * * results: An array of LevelBuildCheckResults to display.
 * * passed: Whether or not the checks passed as a whole.
 */
function BuildChecker(props: {
	checks: LevelBuildCheck[],
	results: LevelBuildCheckResult[],
	passed: boolean
}) {
	const displayStr = props.passed ? 'All requirements have been met!' : 'Requirements have not been met.';
	return (
		<div>
			<h4 className="track-list-title">Build Requirements</h4>
			<div className="check-result-container">
				{getCheckResultElements()}
				<p style={{
					fontSize: '12px',
					margin: '0',
					color: props.passed ? 'limegreen' : 'salmon',
				}}
				>{displayStr}
				</p>
			</div>
		</div>
	);

	/**
	 * Runs all build checks and returns the elements holding the results.
	 * @returns The created elements.
	 */
	function getCheckResultElements() {
		const elements = [];
		for (let i = 0; i < props.checks.length; i++) {
			const thisCheck = props.checks[i];
			const thisResult = props.results[i];
			elements.push(getCheckResultElement(
				thisCheck.label,
				thisResult.passed,

				thisResult.note,
			));
		}
		return elements;
	}

	/**
	 * Creates an element showing a check result.
	 * @param label The label of the check.
	 * @param passed Whether or not the check passed.
	 * @param note A text note left after the processing has completed.
	 * @returns The created element.
	 */
	function getCheckResultElement(label: string, passed: boolean, note: string) {
		const icon = passed
			? <CheckCircleOutlineIcon style={{ color: 'limegreen'/* , animation: 'pop 0.2s' */ }} />
			: <AddCircleOutlineIcon style={{ color: 'salmon', transform: 'rotate(45deg)' }} />;
		return (
			<div
				className="check-result"
				key={`${label}${passed}`}
			>
				{icon}
				<div className={`check-result-wrapper ${passed ? 'pass' : 'fail'}`}>
					<p>{label}</p>
					<p style={{ fontSize: '12px' }}>{note}</p>
				</div>
			</div>
		);
	}
}

/* React.memo(BuildChecker, (props, nextProps) => {
	if (props.results.length !== nextProps.results.length) return false;
	for (let i = 0; i < props.results.length; i++) {
		if (nextProps.results[i].passed !== props.results[i].passed) return false;
	}
	return true;
}); */

export default BuildChecker;
