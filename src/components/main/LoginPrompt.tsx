import TextField from '@components/pages/controls/TextField';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { promptGoogleLogin } from '@scripts/site/FirebaseUtil';
import React, { useState } from 'react';

/**
 * Prompts the user to log in or create a new account.
 */
function LoginPrompt() {
	const [emailInput, setEmailInput] = useState('');
	const [passwordInput, setPasswordInput] = useState('');
	const [isSignup, setIsSignup] = useState(false);
	return (
		<div className="login-prompt-container">
			<h4 style={{ margin: '0' }}>Log In or Sign Up</h4>
			<br />
			<TriggerButton
				text="Use Google Account"
				type="blue"
				onClick={promptGoogleLogin}
			/>
			{/* <p>- or -</p>
			<div style={{ display: 'flex' }}>
				<input id="signup-chk" type="checkbox" onChange={() => { setIsSignup(!isSignup); }} />
				<label htmlFor="signup-chk">Sign Up</label>
			</div>
			<TextField
				label="Email"
				onChange={setEmailInput}
				value={emailInput}
			/>
			<TextField
				label="Password"
				password
				onChange={setPasswordInput}
				value={passwordInput}
			/>
			<div style={{ display: isSignup ? '' : 'none' }}>
				<TextField
					label="Confirm Password"
					password
					onChange={() => {}}
					value=""
				/>
			</div>
			<TriggerButton text="Submit" type="dark" onClick={() => {}} /> */}
		</div>
	);
}

export default LoginPrompt;
