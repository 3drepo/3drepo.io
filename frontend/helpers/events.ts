export const getPointerPosition = (event) => {
	if (event.touches && event.touches[0]) {
		const { left, top } = event.touches[0].target.getBoundingClientRect();
		return {
			x: event.touches[0].pageX - left,
			y: event.touches[0].pageY - top
		};
	}

	return {
		x: event.layerX,
		y: event.layerY
	};
};
