import React from 'react';
import AppFrame from '@components/AppFrame';

/**
 * The landing page of the site.
 */
function About() {
	return (
		<AppFrame title="About - Music Level Studio">
			<h1>About</h1>
			<div style={{ maxWidth: '600px', margin: '0 auto' }}>
				<h2 style={{ textAlign: 'left' }}>Music Levels for Everyone.</h2>
				<p className="explanatory-text">Mario Maker 2 is all about creating.
					And one of the coolest things you can create is custom music.
					It breathes life into a level and adds a whole new dimension of expression,
					all while giving players an auditory spectacle to enjoy.
					But there&apos;s one big problem: good music is very hard and tedious to make
					- putting it out of reach for all but the most dedicated makers.
				</p>
				<p className="explanatory-text">I am here to change that.</p>
				<p className="explanatory-text">Introducing Music Level Studio,
					a web app that promises to change all of that.
					With just the simple click of a button, any music of your choosing will
					instantly be rendered into a working music contraption.
					It&apos;s as simple as that.
					Whether it&apos;s a classic autoscroll music level or a level with looping
					background music, Studio has a lot to offer. And it&apos;s all going to be free for
					everyone to use.
				</p>
				<p className="explanatory-text">
					Here on the Internet, I&apos;m known as UncaughtCursor,
					and I am the sole developer of this web app.
					You may remember my previous site, Music Level Maestro, back when I was called h267.
					Seeing how my simple web tool had helped so many people,
					I started development on this website one year ago to bring the community an even
					more useful tool. Now, it is finally here.
				</p>
				<p className="explanatory-text">
					Developing the site, along with the complex algorithms used to generate music levels,
					has been a huge undertaking. If you find this site helpful and want to support me,
					or just want some awesome perks, you can become my supporter
					on <a href="https://www.patreon.com/UncaughtCursor">Patreon</a>.
				</p>
				<p className="explanatory-text">Thank you for your interest in my project!
					I hope you find good use out of it. ❤️
				</p>
			</div>
		</AppFrame>
	);
}

export default About;
