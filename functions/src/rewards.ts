import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

type Timestamp = admin.firestore.Timestamp;

type Reward = 'Mushroom Patron' | 'Fire Flower Patron' | 'Super Star Patron';
type RewardDays = number | 'Until Expiry';
type RewardExpiry = Timestamp | null;
type UID = string;

interface KeyData {
	expiryDate: RewardExpiry,
	reward: Reward,
	rewardDays: RewardDays,
	redeemedBy: UID | null,
}

interface UserData {
	patronUntil: Timestamp;
}

export type PatronStatus = 'None' | 'Mushroom' | 'Fire Flower' | 'Super Star';

export const getPatronStatus = functions.https.onCall(
	async (_data, context): Promise<PatronStatus> => {
		if (context.auth === undefined) return 'None';

		const userPrivDocRef = admin.firestore().doc(`users/${context.auth.uid}/priv/access`);
		const userPrivDocSnap = await userPrivDocRef.get();
		if (!userPrivDocSnap.exists || userPrivDocSnap.data() === undefined) return 'None';

		const userPrivData = userPrivDocSnap.data()! as {
			patronUntil: Timestamp,
			patronStatus: PatronStatus,
		};

		const patronUntil = userPrivData.patronUntil as Timestamp;

		const now = Date.now();
		const subEndTime = patronUntil.seconds * 1000;
		const hasPatronStatus = now < subEndTime;

		return hasPatronStatus ? userPrivData.patronStatus : 'None';
	},
);

export const redeemKey = functions.https.onCall((data: { key: string }, context) => {
	const keyDocRef = admin.firestore().doc(`keys/${data.key}`);

	return new Promise((resolve) => {
		if (context.auth === undefined) {
			resolve({ success: false, msg: 'The user is not logged in.' });
		}

		keyDocRef.get().then((keySnap) => {
			const now = new Date();
			if (keySnap.exists) {
				const keyData = keySnap.data() as KeyData;
				if (keyData.redeemedBy !== '') {
					// If the redeemedBy field holds a UID, someone has already used it.
					resolve({ success: false, msg: 'The key has already been redeemed.' });
				} else {
					const expiryDate = keyData.expiryDate !== null ? keyData.expiryDate.toDate() : null;
					if (expiryDate === null) {
						// Return result of activating the reward (no expiry date)
						activateReward(
context.auth!.uid,
keyData.reward,
keyData.rewardDays,
						).then((res) => { resolve(res); }).catch((e) => {
							resolve({
								success: false,
								msg: `An exception occurred while attempting to redeem the reward:
								"${e}".`,
							});
						});
					} else if (now.getTime() >= expiryDate.getTime()) {
						// Can't redeem if the current time is past the expiry time
						resolve({ success: false, msg: 'The key is expired.' });
					} else {
						// Return result of activating the reward (with expiry date)
						activateReward(
context.auth!.uid,
keyData.reward,
keyData.rewardDays,
expiryDate,
						).then((res) => { resolve(res); }).catch((e) => {
							resolve({
								success: false,
								msg: `An exception occurred while attempting to redeem the reward:,
								"${e}".`,
							});
						});
					}
				}
			} else {
				// Invalid key if data doesn't exist
				resolve({
					success: false,
					msg: 'The key is invalid. It may have been entered incorrectly.',
				});
			}
		});
	});

	/**
	 * Attempts to activate a reward on the user's account.
	 * This DOES NOT check that the reward is expired.
	 * It only uses the key expiry date to apply rewards that use the expiry date.
	 * @param uid The user ID to activate the reward on.
	 * @param reward The reward type.
	 * @param days The number of days that the reward lasts or a value specifying otherwise.
	 * @param expiryDate The expiration date of the reward key if there is one.
	 * @returns Whether or not the operation was successful and a message if there is an error.
	 */
	async function activateReward(
		uid: string,
		reward: Reward,
		days: RewardDays,
		expiryDate?: Date,
	): Promise<{success: boolean, msg: string}> {
		const millisPerDay = 86400000;
		const nowMillis = Date.now();

		// Get user data
		const userPrivDocRef = admin.firestore().doc(`/users/${uid}/priv/access`);
		const userPrivDocSnap = await userPrivDocRef.get();
		if (!userPrivDocSnap.exists) return { success: false, msg: 'User data does not exist.' };
		const userData = userPrivDocSnap.data()! as UserData;

		// TODO: Eventually generalize for other rewards
		// Reward's expiry date adds to today's date if in the past, else it adds onto the
		// user's future patron expiry
		const currentExpiry = userData.patronUntil.toDate().getTime() <= nowMillis
			? nowMillis : userData.patronUntil.toDate().getTime();

		// Compute expiry date when redeemed
		let redeemedExpiryTime: number;
		if (days !== 'Until Expiry') {
			// Reward lasts n days after redemption
			redeemedExpiryTime = currentExpiry + (days * millisPerDay);
		} else {
			// Reward ends on the specified date
			const rewardExpireMillis = expiryDate!.getTime();
			if (currentExpiry >= rewardExpireMillis) {
				return {
					success: false,
					msg: 'The user already has patron status up'
				+ ' through the reward\'s expiration date. This key may be given'
				+ ' away to another user to make use of it.',
				};
			}
			redeemedExpiryTime = rewardExpireMillis;
		}

		// Convert to seconds
		redeemedExpiryTime = Math.floor(redeemedExpiryTime / 1000);

		// Redeem reward - set relevant field in the user data
		if (reward === 'Mushroom Patron' || reward === 'Fire Flower Patron' || reward === 'Super Star Patron') {
			await userPrivDocRef.set({
				patronUntil: new admin.firestore.Timestamp(redeemedExpiryTime, 0),
				patronStatus: reward.replace(' Patron', ''),
			}, { merge: true });
		} else {
			return { success: false, msg: 'Invalid reward type.' };
		}

		// Set the key as redeemed
		await keyDocRef.set({
			redeemedBy: uid,
		}, { merge: true });

		return { success: true, msg: 'Redeem succeeded!' };
	}
});
