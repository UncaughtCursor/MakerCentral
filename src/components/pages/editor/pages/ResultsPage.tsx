import React, { useContext } from 'react';
import LevelDisplay from '../controls/output/LevelDisplay';
import EditorContext from '../EditorContext';

/**
 * The page that displays build results.
 */
function ResultsPage() {
	const ctx = useContext(EditorContext);
	const buildInst = ctx.project.buildInstances[0];
	const configText = buildInst.optResultConfig === null ? ''
		: `Scroll Level Using: ${buildInst.optResultConfig.scrollMethod.name}`;
	return (
		<>
			<h1>View Results</h1>
			<p className="explanatory-text">The results are displayed below.
				Generally, be sure to copy each block and item exactly as shown.
			</p>
			<p className="explanatory-text">Some potentially confusing icons and contraptions will
				display a description when hovered over or tapped on.
				Be aware of semisolids and parachuting entities (the latter play a bobbing animation).
			</p>
			<p className="explanatory-text">Please remember to make changes in the editor to honor the scroll speed,
				otherwise the music <b>will not work</b>.
			</p>
			<p className="explanatory-text">For looping music, ensure that the player is able to consistently load the enemies when
				following the intended movements.
				The entire contraption may need to be moved forwards or backwards.
			</p>
			<LevelDisplay />
			<div style={{ display: buildInst.optResultConfig === null ? 'none' : '' }}>
				<p style={{ marginTop: '-16px' }}><b>{configText}</b></p>
			</div>
		</>
	);
}

export default ResultsPage;
