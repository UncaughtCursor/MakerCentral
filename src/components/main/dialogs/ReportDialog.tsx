import TextArea from '@components/pages/controls/TextArea';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { db, randomString } from '@scripts/site/FirebaseUtil';
import { doc, setDoc } from 'firebase/firestore/lite';
import React, { useState } from 'react';
import Dialog from '../Dialog';

/**
 * A dialog used for reporting violations.
 * @param props The props:
 * * open: Whether or not the dialog is open.
 * * onCloseEvent: What to do when the dialog closes.
 * * documentPath: The path and ID of the document containing the content being reported.
 */
function ReportDialog(props: {
	open: boolean,
	onCloseEvent: () => void,
	documentPath: string,
}) {
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	return (
		<Dialog title="Report Violation" open={props.open} onCloseEvent={props.onCloseEvent}>
			<div style={{
				width: 'max-content',
				margin: '0 auto',
				marginBottom: '5px',
			}}
			>
				<TextArea
					label="Reason"
					value={text}
					maxLength={500}
					widthPx={250}
					heightPx={100}
					onChange={(val) => { setText(val); }}
				/>
			</div>
			<TriggerButton text="Send" type="blue" onClick={sendReport} isLoading={loading} />
			<TriggerButton text="Cancel" type="flush" onClick={() => { props.onCloseEvent(); }} />
		</Dialog>
	);

	/**
	 * Sends the current working report.
	 */
	async function sendReport() {
		setLoading(true);
		await setDoc(doc(db, `/reports/${randomString(24)}`), {
			docPath: props.documentPath,
			reason: text,
		});
		setLoading(false);
		props.onCloseEvent();
	}
}

export default ReportDialog;
