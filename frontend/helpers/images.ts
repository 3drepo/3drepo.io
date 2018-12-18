export const loadImage = (source) => new Promise((resolve, reject) => {
	const imgObj = new Image();

	imgObj.onload = () => {
		resolve(imgObj);
	};

	imgObj.src = source;
});
