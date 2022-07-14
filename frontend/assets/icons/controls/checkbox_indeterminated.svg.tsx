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
export default ({ className = '', borderColor }) => (
	<svg width="16" height="16" className={className} style={{ borderRadius: 0 }} viewBox="0 0 16 16" stroke="none" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M 2,0 C 0.90064972,0 0,0.90064972 0,2 v 12 c 0,1.09935 0.90064972,2 2,2 h 12 c 1.09935,0 2,-0.90065 2,-2 V 2 C 16,0.90064972 15.09935,0 14,0 Z m 0,1 h 12 c 0.562648,0 1,0.4373519 1,1 v 12 c 0,0.562648 -0.437352,1 -1,1 H 2 C 1.4373519,15 1,14.562648 1,14 V 2 C 1,1.4373519 1.4373519,1 2,1 Z"
			fill={borderColor}
		/>
		<rect x="4" y="4" width="8" height="8" fill="currentColor" strokeWidth="0" />
	</svg>
);
