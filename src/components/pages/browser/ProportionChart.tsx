import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
	Chart, ArcElement, Tooltip, Legend,
} from 'chart.js';

const textColor = '#fff';
const borderColor = '#282c34';

Chart.register(ArcElement, Tooltip, Legend);
Chart.defaults.color = textColor;
Chart.defaults.borderColor = borderColor;

export type ProportionChartProportion = {[key: string]: {
	value: number;
	color: string;
}};

export interface ProportionChartProps {
	proportion: ProportionChartProportion;
	title: string;
}

/**
 * A component that renders a proportion chart.
 * @param props The props:
 * * proportion: The proportions as a map of key to value and color.
 * * title: The title of the chart.
 */
function ProportionChart(props: ProportionChartProps) {
	const { proportion } = props;
	const unfilteredLabels = Object.keys(proportion);
	const unfilteredValues = Object.values(proportion).map((p) => p.value);
	const unfilteredColors = Object.values(proportion).map((p) => p.color);

	// Remove entries whose values are 0.
	const labels = [];
	const values = [];
	const colors = [];
	for (let i = 0; i < unfilteredLabels.length; i++) {
		if (unfilteredValues[i] > 0) {
			labels.push(unfilteredLabels[i]);
			values.push(unfilteredValues[i]);
			colors.push(unfilteredColors[i]);
		}
	}

	return (
		<div className="doughnut-container">
			<h3>{props.title}</h3>
			<Doughnut
				data={{
					labels,
					datasets: [{
						data: values,
						backgroundColor: colors,
					}],
				}}
				options={{
					borderColor,
					plugins: {
						tooltip: {
							enabled: true,
							callbacks: {
								label(context) {
									let label = context.label;
									const value = context.formattedValue;

									if (!label) label = 'Unknown';

									let sum = 0;
									const dataArr = context.chart.data.datasets[0].data;
									dataArr.forEach((data) => {
										sum += Number(data);
									});

									const percentage = `${((parseFloat(value) * 100) / sum).toFixed(2)}%`;
									return `${label}: ${percentage}`;
								},
							},
						},
					},
				}}
			/>
		</div>
	);
}

export default ProportionChart;
