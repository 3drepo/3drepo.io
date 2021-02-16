export const transformLegend = (legendOriginalObj) =>
	Object.keys(legendOriginalObj).map((key) => ({
		name: key,
		color: legendOriginalObj[key],
	}));

export const transformToLegendObj = (legend) => legend.reduce((obj, { name, color }) => {
	obj[`${name}`] = color;
	return obj;
}, {});
