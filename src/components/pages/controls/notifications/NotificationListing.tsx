import { Notification } from '@components/main/NotificationWidget';
import Link from 'next/link';
import React from 'react';
import TimeAgo from 'javascript-time-ago';

const timeAgo = new TimeAgo('en-us');

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
			<div className={`notification-listing${!props.notification.read ? ' hl' : ''}`}>
				<div className="notification-listing-text-container">
					<span>{props.notification.text}</span>
					<span>{timeAgo.format(new Date(props.notification.timestamp))}</span>
				</div>
			</div>
		</Link>
	);
}

export default NotificationListing;
