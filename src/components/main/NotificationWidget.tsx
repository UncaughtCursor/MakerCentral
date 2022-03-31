import useUserInfo from '@components/hooks/useUserInfo';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { db } from '@scripts/site/FirebaseUtil';
import {
	collection, getDocs, orderBy, query, where,
} from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export interface Notification {
	text: string,
	timestamp: number,
	type: 'likes' | 'comments' | 'ranks' | 'admin' | 'misc',
	link: string,
	read: boolean,
}

const refreshPeriodSec = 3;

/**
 * The notification icon and menu that displays next to the user or hamburger menu.
 */
function NotificationWidget() {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	const [notifs, setNotifs] = useState([] as Notification[]);

	const notifQuery = user !== null ? query(
		collection(db, `users/${user.uid}/notifications`),
		where('read', '==', false),
		orderBy('timestamp', 'desc'),
	) : null;

	const fetchNotifs = async () => {
		if (notifQuery === null) return;
		const notifDocs = (await getDocs(notifQuery)).docs;
		const notifications = notifDocs.map((doc) => doc.data() as Notification);
		setNotifs(notifications);
	};

	useEffect(() => {
		const interval = (typeof window !== 'undefined') ? window.setInterval(fetchNotifs, refreshPeriodSec * 1000) : null;
		fetchNotifs();

		return () => {
			if (interval !== null) window.clearInterval(interval);
		};
	}, [user]);

	return (
		<Link href="/notifications">
			<div className="notification-icon-container" style={{ display: user !== null ? '' : 'none' }}>
				<div
					className="notification-badge"
					style={{
						display: notifs.length > 0 ? '' : 'none',
					}}
				>
					<span>{notifs.length}</span>
				</div>
				<NotificationsOutlinedIcon fontSize="large" />
			</div>
		</Link>
	);
}

export default NotificationWidget;
