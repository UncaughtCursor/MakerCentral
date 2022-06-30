import React from 'react';

interface IconValue {
	icon: React.ReactNode;
	value: string | number;
}

/**
 * A row of icons and values.
 * @param props The props:
 * - values: The icons and values.
 */
function IconValueRow(props: {
	values: IconValue[];
}) {
	return (
		<div className="icon-value-row">
			{props.values.map((row) => (
				<div key={row.value} className="icon-value-row-item">
					{row.icon}
					<p>{row.value}</p>
				</div>
			))}
		</div>
	);
}

export default IconValueRow;
