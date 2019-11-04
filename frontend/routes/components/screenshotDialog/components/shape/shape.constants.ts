import { Arrow, Circle, Cloud, Cloudline, Line, Rectangle, Triangle } from './shape.helpers';

export const SHAPE_TYPES = {
	RECTANGLE: 1,
	TRIANGLE: 2,
	CIRCLE: 3,
	LINE: 4,
	CLOUD: 5,
	ARROW: 6,
	CLOUDLINE: 7,
};

export const SHAPE_COMPONENTS = {
	[SHAPE_TYPES.RECTANGLE]: Rectangle,
	[SHAPE_TYPES.TRIANGLE]: Triangle,
	[SHAPE_TYPES.CIRCLE]: Circle,
	[SHAPE_TYPES.LINE]: Line,
	[SHAPE_TYPES.CLOUD]: Cloud,
	[SHAPE_TYPES.ARROW]: Arrow,
	[SHAPE_TYPES.CLOUDLINE]: Cloudline,
};
