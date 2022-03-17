import React, { useState } from 'react';
import { functions } from '@scripts/site/FirebaseUtil';
import { httpsCallable } from 'firebase/functions';
import TextField from '../TextField';
import TriggerButton from '../TriggerButton';

const redeemKey = httpsCallable(functions, 'redeemKey');

/**
 * A control used for redeeming reward keys.
 * @param props The props:
 * * onSuccess: A function to trigger when a code is successfully entered
 */
function RewardRedeemer(props: {
	onSuccess?: () => void,
}) {
	const [key, setKey] = useState('');
	const [statusText, setStatusText] = useState('');
	return (
		<div>
			<div style={{
				display: 'flex',
				gap: '10px',
				justifyContent: 'center',
				alignItems: 'center',
			}}
			>
				<TextField
					label="Reward Key"
					value={key}
					widthPx={160}
					onChange={(input: string) => {
						setKey(input);
					}}
				/>
				<TriggerButton
					text="Submit"
					type="blue"
					onClick={submitKey}
					isLoading={statusText === 'Submitting...'}
				/>
			</div>
			<p style={{ fontSize: '13px' }}>{statusText}</p>
		</div>
	);

	/**
	 * Submits a reward key and updates the status text accordingly.
	 */
	function submitKey() {
		if (key === '') return;
		setStatusText('Submitting...');
		redeemKey({ key }).then((result) => {
			const data = result.data as { success: boolean, msg: string };
			if (data.success) {
				setStatusText('Redeem successful!');
				// TODO: Functionality to listen for specific rewards
				props.onSuccess!();
			} else setStatusText(`Redeem failed with the message: ${data.msg}`);
		}).catch((e) => {
			setStatusText(e);
		});
	}
}

RewardRedeemer.defaultProps = {
	onSuccess: () => {},
};

export default RewardRedeemer;
