
import * as React from 'react';
import {
	Rect as RectangleComponent,
	Shape as ShapeComponent,
	Circle as CircleComponent,
	RegularPolygon as PolygonComponent
} from 'react-konva';

const TriangleComponent = React.forwardRef((props: any, ref: any) => {
	return (
		<PolygonComponent
			{...props}
			ref={ref}
			sides={3}
		/>
	);
});

const LineComponent = React.forwardRef((props: any, ref: any) => {
	return (
		<RectangleComponent
			{...props}
			ref={ref}
			height={0}
			fill={props.color}
		/>
	);
});

const CloudComponent = React.forwardRef((props: any, ref: any) => {
	return (
		<ShapeComponent
			{...props}
			ref={ref}
			sceneFunc={drawCloud}
		/>
	);
});

export const drawCloud = (context, cloud) => {
	const x = 25;
	const y = 58;
	context.beginPath();
	context.moveTo(x, y);
	context.bezierCurveTo((x - 40), (y + 20), (x - 40), (y + 70), (x + 60), (y + 70));
	context.bezierCurveTo((x + 80), (y + 100), (x + 150), (y + 100), (x + 170), (y + 70));
	context.bezierCurveTo((x + 250), (y + 70), (x + 250), (y + 40), (x + 220), (y + 20));
	context.bezierCurveTo((x + 260), (y - 40), (x + 200), (y - 50), (x + 170), (y - 30));
	context.bezierCurveTo((x + 150), (y - 75), (x + 80), (y - 60), (x + 80), (y - 30));
	context.bezierCurveTo((x + 30), (y - 75), (x - 20), (y - 60), x, y);
	context.closePath();
	context.fillStrokeShape(cloud);
};

export const Circle = CircleComponent;
export const Rectangle = RectangleComponent;
export const Triangle = TriangleComponent;
export const Line = LineComponent;
export const Cloud = CloudComponent;
