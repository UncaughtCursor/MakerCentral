import AppFrame from '@components/AppFrame';
import ActionButton from '@components/pages/controls/ActionButton';
import React from 'react';

function Page404() {
	return (
		<AppFrame title="404 - Music Level Studio">
			<h1>404 - Page Not Found</h1>
			<p>The page you are looking for can&apos;t be found.</p>
			<ActionButton to="/" text="Save me from the void!" />
		</AppFrame>
	);
}

export default Page404;
