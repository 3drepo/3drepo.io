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
		width="20"
		height="15"
		viewBox="0 0 20 15"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M7.935 9.628V4.008L13.338 6.828L7.935 9.628ZM19.8 3.035C19.8 3.035 19.605 1.656 19.005 1.049C18.245 0.253 17.392 0.249 17.001 0.202C14.203 1.3411e-07 10.004 0 10.004 0H9.996C9.996 0 5.798 1.3411e-07 2.999 0.202C2.608 0.249 1.756 0.252 0.995 1.049C0.395 1.656 0.2 3.035 0.2 3.035C0.2 3.035 0 4.653 0 6.272V7.789C0 9.407 0.2 11.026 0.2 11.026C0.2 11.026 0.395 12.404 0.995 13.011C1.755 13.808 2.755 13.782 3.2 13.866C4.8 14.019 10 14.066 10 14.066C10 14.066 14.203 14.06 17.001 13.858C17.392 13.811 18.245 13.808 19.005 13.011C19.605 12.404 19.8 11.026 19.8 11.026C19.8 11.026 20 9.407 20 7.789V6.272C20 4.653 19.8 3.035 19.8 3.035Z"
			fill="currentColor"
		/>
	</svg>
);
