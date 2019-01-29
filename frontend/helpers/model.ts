const negatePositionYZ = (position = []) => {
	const [x, y, z] = position.map(Number);
	return [x, -z, -y];
};

export const convertPositionToOpenGL = negatePositionYZ;

export const convertPositionToDirectX = negatePositionYZ;
