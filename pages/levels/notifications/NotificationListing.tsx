import { Notification } from '@components/main/NotificationWidget';
import Link from 'next/link';
import React from 'react';

/**
 * A listing for a notification.
 * @param props The props:
 * * notification: The notification object to display.
 */
function NotificationListing(props: {
	notification: Notification,
}) {
	return (
		<Link href={props.notification.link}>
			<div className="notification-listing">
				<div className="notification-listing-text-container">
					<span>{props.notification.text}</span>
					<span>{props.notification.timestamp}</span>
				</div>
			</div>
		</Link>
	);
}

export default NotificationListing;
