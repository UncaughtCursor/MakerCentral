import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export interface CheckResult {
	label: string,
	passed: boolean,
	note: string,
}

/**
 * A component that displays the status of a series of checks to the user.
 * @param props The props:
 * * title: The title of the checks widget.
 * * results: An array of results for the checks.
 * * passed: Whether or not the checks passed as a whole.
 * * showPassed (Optional) Whether or not to show passed tests. True by default.
 */
function ChecksWidget(props: {
	title: string,
	results: CheckResult[],
	passed: boolean,
	showPassed?: boolean,
}) {
	const displayStr = props.passed ? 'All requirements have been met!' : 'Requirements have not been met.';
	return (
		<div style={{ display: props.passed && !props.showPassed! ? 'none' : '' }}>
			<h4 className="track-list-title">{props.title}</h4>
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
	 * Returns the elements holding the check results.
	 * @returns The created elements.
	 */
	function getCheckResultElements() {
		const elements = [];
		for (let i = 0; i < props.results.length; i++) {
			const thisResult = props.results[i];
			if (thisResult.passed && !props.showPassed!) continue;
			elements.push(getCheckResultElement(
				thisResult.label,
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

ChecksWidget.defaultProps = {
	showPassed: true,
};

export default ChecksWidget;
