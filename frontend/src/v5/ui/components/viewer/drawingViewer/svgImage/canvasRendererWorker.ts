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
/* eslint-disable @typescript-eslint/no-unused-vars */

let tiles = [];

self.onmessage = (event) => {
	if (event.data.method) {
		this[event.data.method]?.apply(this, event.data.payload);
	} else {
		console.log(event);
	}
};

function setTiles(tt) {
	tiles = tt;
}

function renderCanvas(index, bitmap ) {
	const { width, height } = bitmap;
	const canvas = tiles[index];
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(bitmap, 0, 0);
}