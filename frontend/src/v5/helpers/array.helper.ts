/**
 *  Copyright (C) 2026 3D Repo Ltd
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

export const chunkEscalated = <T>(array: T[], chunkSizes: number[]): T[][] => {
	const chunks: T[][] = [];

	let currentIndex = 0;
	let currentChunkSizeIndex = 0;

	while (currentIndex < array.length) {
		const chunkSize = chunkSizes[currentChunkSizeIndex];
		const chunk = array.slice(currentIndex, currentIndex + chunkSize);
		chunks.push(chunk);
		currentIndex += chunkSize;

		if (currentChunkSizeIndex < chunkSizes.length - 1) {
			currentChunkSizeIndex++;
		}
	}

	return chunks;
};