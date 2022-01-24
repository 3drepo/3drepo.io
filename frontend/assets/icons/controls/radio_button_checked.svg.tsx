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
import React from 'react';

export default (props) => (
	// eslint-disable-next-line react/destructuring-assignment
	<svg width="24" height="24" viewBox="0 0 24 24" className={props.className} xmlns="http://www.w3.org/2000/svg">
		<circle cx="12" cy="12" r="11.5" fill="none" />
		<circle cx="12" cy="12" r="7" fill="currentColor" />
		<defs>
			<linearGradient id="paint0_linear_3329_48113" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
				<stop stopColor="white" />
				<stop offset="1" stopColor="white" stopOpacity="0" />
			</linearGradient>
		</defs>
	</svg>
);
