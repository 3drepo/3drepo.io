import { Rectangle, Circle, Triangle, Line, Cloud1, Cloud2 } from './shape.helpers';

export const SHAPE_TYPES = {
	RECTANGLE: 1,
	TRIANGLE: 2,
	CIRCLE: 3,
	LINE: 4,
	CLOUD1: 5,
	CLOUD2: 6,
	DRAWING: 7
};

export const SHAPE_COMPONENTS = {
	[SHAPE_TYPES.RECTANGLE]: Rectangle,
	[SHAPE_TYPES.TRIANGLE]: Triangle,
	[SHAPE_TYPES.CIRCLE]: Circle,
	[SHAPE_TYPES.LINE]: Line,
	[SHAPE_TYPES.CLOUD1]: Cloud1,
	[SHAPE_TYPES.CLOUD2]: Cloud2,
	[SHAPE_TYPES.DRAWING]: Line
};
