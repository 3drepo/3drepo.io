const negatePositionYZ = (position = []) => {
	const [x, y, z] = position.map(Number);
	return [x, -z, -y];
};

export const convertPositionToOpenGL = negatePositionYZ;

export const convertPositionToDirectX = negatePositionYZ;

export const convertLabelsToNames = (items = []) => {
	items.map(item => item.name = item.label);
	return items;
};
