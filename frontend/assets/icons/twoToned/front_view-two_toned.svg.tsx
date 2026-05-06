/**
 *  Copyright (C) 2020 3D Repo Ltd
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

type IProps = {
	className?: any;
};

const wallStyle = { fill: '#dadada' };
const cubeStyle = { fill: 'none', stroke: '#b2b2b2', strokeMiterlimit: 10, strokeWidth: 8 } as const;

export default ({ className }: IProps) => (
	<svg viewBox="0 0 327.5 358" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g style={wallStyle}>
			<rect x="1.5" y="105.7" width="248.3" height="248.3" />
		</g>
		<g style={cubeStyle}>
			<polyline points="252.3 354 252.3 105.7 323.5 4 252.3 105.7 4 105.7" />
			<polygon points="75.2 4 4 105.7 4 354 252.3 354 323.5 252.3 323.5 4 75.2 4" />
		</g>
	</svg>
);
