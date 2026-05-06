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
const dashStyle = { fill: 'none', stroke: '#b2b2b2', strokeMiterlimit: 10, strokeWidth: 8, strokeDasharray: 12 } as const;

export default ({ className }: IProps) => (
	<svg viewBox="0 0 328 358" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g style={wallStyle}>
			<rect x="75.7" y="4" width="248.3" height="248.3" />
			<line style={dashStyle} x1="3.3" y1="354" x2="74.5" y2="252.3" />
			<line style={dashStyle} x1="74.5" y1="252.3" x2="322.8" y2="252.3" />
			<line style={dashStyle} x1="74.5" y1="4" x2="74.5" y2="252.3" />
		</g>
		<g style={cubeStyle}>
			<polyline points="252.8 354 252.8 105.7 324 4 252.8 105.7 4.5 105.7" />
			<polygon points="75.7 4 4.5 105.7 4.5 354 252.8 354 324 252.3 324 4 75.7 4" />
		</g>
	</svg>
);
