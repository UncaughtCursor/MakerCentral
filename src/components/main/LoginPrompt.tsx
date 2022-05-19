import TextField from '@components/pages/controls/TextField';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { promptLogin } from '@scripts/site/FirebaseUtil';
import React, { useState } from 'react';

/**
 * Prompts the user to sign in or create a new account.
 */
function LoginPrompt() {
	const [emailInput, setEmailInput] = useState('');
	const [passwordInput, setPasswordInput] = useState('');
	const [isSignup, setIsSignup] = useState(false);
	return (
		<div className="login-prompt-container">
			<br />
			<TriggerButton
				text="Sign In or Register"
				type="blue"
				onClick={promptLogin}
			/>
		</div>
	);
}

export default LoginPrompt;
