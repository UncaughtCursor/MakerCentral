import useUserInfo from '@components/hooks/useUserInfo';
import {
	auth, db, functions, getUser,
} from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore/lite';
import { httpsCallable } from 'firebase/functions';
import React, { useEffect, useState } from 'react';
import TriggerButton from '../controls/TriggerButton';
import TagSelector from './TagSelector';

/**
 * A control that allows users to like or dislike a level.
 * @param props The props:
 * * levelId: The ID of the level to vote on.
 */
function FeedbackControl(props: {
	levelId: string,
}) {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;
	const [loading, setLoading] = useState(true);
	const [voteVal, setVoteVal] = useState(0 as 1 | 0 | -1);

	useEffect(() => {
		if (user === null) {
			setLoading(false);
			return;
		}
		const engagementRef = doc(db, `/users/${user.uid}/engagements/${props.levelId}`);
		getDoc(engagementRef).then((engagementRefSnap) => {
			if (!engagementRefSnap.exists()) setVoteVal(0);
			else {
				const data = engagementRefSnap.data()!;
				setVoteVal(data.voteVal);
			}
			setLoading(false);
		}).catch((e) => {
			console.error(e);
			// eslint-disable-next-line no-alert
			alert('An error occurred while attempting to load vote status.');
			setLoading(false);
		});
	}, [user]);

	const initialTags = [];
	if (voteVal === 1) initialTags.push('I liked it!');
	if (voteVal === -1) initialTags.push('I didn\'t like it...');

	if (user === null) {
		return (
			<div>
				<p>Please sign in to leave feedback.</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div>
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="feedback-control-container">
			<TagSelector
				label=""
				tags={['I liked it!', 'I didn\'t like it...']}
				initialTags={initialTags}
				onChange={(values: string[]) => {
					let queuedVoteVal: 1 | 0 | -1 = 0;
					if (values.length > 0) {
						queuedVoteVal = (values[0] === 'I liked it!') ? 1 : -1;
					}
					submitVote(queuedVoteVal);
				}}
				limit={1}
				forceInitTags
			/>
		</div>
	);

	/**
	 * Submits a level vote and waits on the results.
	 * @param queuedVoteVal The value of the vote.
	 */
	function submitVote(queuedVoteVal: 1 | 0 | -1) {
		setLoading(true);
		const voteFn = httpsCallable(functions, 'voteOnLevel');

		voteFn({ levelId: props.levelId, voteVal: queuedVoteVal }).then(() => {
			setVoteVal(queuedVoteVal);
			setLoading(false);
		}).catch((e) => {
			// eslint-disable-next-line no-alert
			alert('An error occurred while attempting to vote.');
			console.error(e);
		});
	}
}

export default FeedbackControl;
