/**
 *  Copyright (C) 2021 3D Repo Ltd
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
export default ({ className = '', tickColor = '' }) => (
	<svg width="16" height="16" className={className} style={{ borderRadius: 0 }} viewBox="0 0 16 16" stroke="none" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill="currentColor"
			strokeWidth="0"
			d="M 2 0 C 0.89200111 0 0 0.89200111 0 2 L 0 14 C 0 15.107999 0.89200111 16 2 16 L 14 16 C 15.107999 16 16 15.107999 16 14 L 16 2 C 16 0.89200111 15.107999 0 14 0 L 2 0 z M 11.878906 5 L 13.3125 6.4335938 L 7.1230469 12.621094 L 7.1054688 12.603516 L 7.0878906 12.621094 L 2.6875 8.2226562 L 4.1210938 6.7890625 L 7.1054688 9.7734375 L 11.878906 5 z "
		/>
		<path
			d="m 7.10537,11.793195 -0.01762,0.01762 -4.39985,-4.39984 1.43268,-1.43268 2.98484,2.98485 4.77402,-4.77402 1.43266,1.43268 -6.18906,6.18907 z"
			fill={tickColor}
		/>
	</svg>
);
