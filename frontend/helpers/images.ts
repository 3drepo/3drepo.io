export const loadImage = (source) => new Promise((resolve, reject) => {
	const image = new Image();

	image.onload = () => resolve(image);

	image.src = source;
});
