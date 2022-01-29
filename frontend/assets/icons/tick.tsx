/**
 *  Copyright (C) 2022 3D Repo Ltd
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

type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg
		width="15"
		height="15"
		viewBox="0 0 16 12"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path d="M1 6L7 11L15 1" stroke="#00C1D4" strokeWidth="1.33333" />
	</svg>
);
