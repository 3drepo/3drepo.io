/**
 *  Copyright (C) 2024 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export class Vector2 {

	x: number;

	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	get norm() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}

	get inverse() {
		return new Vector2(-this.x, -this.y);
	}

	static add(a: Vector2, b: Vector2) {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(b.x - a.x, b.y - a.y);
	}

	static norm(a: Vector2, b: Vector2): number {
		const d = Vector2.subtract(a, b);
		return d.norm;
	}
}

export class Line {

	start: Vector2;

	end: Vector2;

	constructor(start: Vector2, end: Vector2) {
		this.start = start;
		this.end = end;
	}

	get length() {
		return Vector2.norm(this.start, this.end);
	}
}

export class Point {
	x: number;

	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

export class Size {

	width: number;

	height: number;

	constructor(width, height) {
		this.width = width;
		this.height = height;
	}
}