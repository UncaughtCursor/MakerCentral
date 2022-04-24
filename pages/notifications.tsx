import AppFrame from '@components/AppFrame';
import React, { useEffect, useState } from 'react';
import { Notification } from '@components/main/NotificationWidget';
import {
	collection, getDocs, orderBy, query, setDoc,
} from 'firebase/firestore/lite';
import { db } from '@scripts/site/FirebaseUtil';
import useUserInfo from '@components/hooks/useUserInfo';
import NotificationListing from './levels/notifications/NotificationListing';

/**
 * The page that displays the user's notifications.
 */
function NotificationPage() {
	const [notifs, setNotifs] = useState([] as Notification[]);
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	useEffect(() => {
		if (user === null) return;
		(async () => {
			const notifQuery = query(collection(
				db,
				`/users/${user.uid}/notifications`,
			), orderBy('timestamp', 'desc'));
			const notifDocs = (await getDocs(notifQuery)).docs;
			const loadedNotifs = notifDocs.map(
				(doc) => doc.data() as Notification,
			);
			setNotifs(loadedNotifs);
			await Promise.all(notifDocs.map(async (doc) => {
				if (!doc.data().read) {
					await setDoc(doc.ref, {
						read: true,
					}, { merge: true });
				}
			}));
		})();
	}, [user]);

	return (
		<AppFrame title="Notifications - MakerCentral">
			<h1>Notifications</h1>
			<div className="notification-listing-container">
				{getNotifElements()}
			</div>
		</AppFrame>
	);

	/**
	 * Generates the notification listing elements to display.
	 * @returns The generated elements.
	 */
	function getNotifElements() {
		return notifs.map((notif) => (
			<NotificationListing
				key={notif.timestamp}
				notification={notif}
			/>
		));
	}
}

export default NotificationPage;
