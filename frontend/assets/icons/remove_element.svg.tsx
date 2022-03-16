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

export default ({ className }: IProps) =>
	(
		<svg
			width="32"
			height="32"
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<circle cx="16" cy="16" r="16" fill="#BE4343" />
			<path d="M12 12L19.7824 19.7824" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M12 12L19.7824 19.7824" stroke="url(#paint0_linear_2608_60083)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M12 20L19.7824 12.2176" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M12 20L19.7824 12.2176" stroke="url(#paint1_linear_2608_60083)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<defs>
				<linearGradient id="paint0_linear_2608_60083" x1="12.3536" y1="11.6464" x2="20.1359" y2="19.4288" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" />
					<stop offset="1" stopColor="white" stopOpacity="0" />
				</linearGradient>
				<linearGradient id="paint1_linear_2608_60083" x1="11.6464" y1="19.6464" x2="19.4288" y2="11.8641" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" />
					<stop offset="1" stopColor="white" stopOpacity="0" />
				</linearGradient>
			</defs>
		</svg>
	);
