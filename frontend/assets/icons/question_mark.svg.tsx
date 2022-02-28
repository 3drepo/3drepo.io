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
	<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M14.4577 7.76562C14.4577 11.6325 11.3779 14.7656 7.57943 14.7656C3.78094 14.7656 0.701172 11.6325 0.701172 7.76562C0.701172 3.90103 3.78094 0.765625 7.57943 0.765625C11.3779 0.765625 14.4577 3.90103 14.4577 7.76562ZM7.76401 3.08014C6.25254 3.08014 5.28853 3.72812 4.53153 4.87976C4.43346 5.02896 4.46627 5.23019 4.60683 5.33866L5.56921 6.08128C5.71357 6.19269 5.91925 6.16618 6.03141 6.02138C6.52686 5.38184 6.86659 5.01098 7.6207 5.01098C8.1873 5.01098 8.88813 5.3821 8.88813 5.94125C8.88813 6.36396 8.54525 6.58104 7.98581 6.90025C7.33337 7.27246 6.47004 7.73573 6.47004 8.89466V9.00756C6.47004 9.19461 6.61906 9.34627 6.80285 9.34627H8.35601C8.53981 9.34627 8.68883 9.19461 8.68883 9.00756V8.96994C8.68883 8.16657 10.996 8.13312 10.996 5.95917C10.996 4.32202 9.32732 3.08014 7.76401 3.08014ZM7.57943 10.0801C6.87594 10.0801 6.30363 10.6626 6.30363 11.3785C6.30363 12.0944 6.87594 12.6769 7.57943 12.6769C8.28293 12.6769 8.85524 12.0944 8.85524 11.3785C8.85524 10.6626 8.28293 10.0801 7.57943 10.0801Z" fill="currentColor" />
	</svg>
);
