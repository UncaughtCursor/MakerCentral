import AppFrame from '@components/AppFrame';
import React, { useEffect, useState } from 'react';
import { Notification } from '@components/main/NotificationWidget';
import { collection, getDocs, query } from 'firebase/firestore/lite';
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
			const notifQuery = query(collection(db, `/users/${user.uid}/notifications`));
			const loadedNotifs = (await getDocs(notifQuery)).docs.map(
				(doc) => doc.data() as Notification,
			);
			setNotifs(loadedNotifs);
		})();
	}, [user]);

	return (
		<AppFrame title="Notifications - Music Level Studio">
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
