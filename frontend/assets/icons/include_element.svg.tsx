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
type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg
		width="32"
		height="32"
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<circle cx="16" cy="16" r="16" fill="#00C1D4" />
		<path d="M21 16.7143H16.7143V21H15.2857V16.7143H11V15.2857H15.2857V11H16.7143V15.2857H21V16.7143Z" fill="white" />
		<path d="M21 16.7143H16.7143V21H15.2857V16.7143H11V15.2857H15.2857V11H16.7143V15.2857H21V16.7143Z" fill="url(#paint0_linear_3146_49406)" />
		<defs>
			<linearGradient id="paint0_linear_3146_49406" x1="16" y1="11" x2="16" y2="21" gradientUnits="userSpaceOnUse">
				<stop stopColor="white" />
				<stop offset="1" stopColor="white" stopOpacity="0" />
			</linearGradient>
		</defs>
	</svg>
);
