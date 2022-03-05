import Footer from "@components/main/Footer";
import Header from "@components/main/Header";
import React from "react";

function AppFrame(props: {
	children: React.ReactNode,
}) {
	return (
		<div className="App">
			<Header />
			<div className="web-content-container">
				{props.children}
				<Footer />
			</div>
		</div>
	);
}

export default AppFrame;