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
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M1.44643 1.44643H16.5536V6.8919L14.9692 5.08171L10.9961 9.73453L6.9996 5.05434L3.09046 9.91405L1.44643 7.97811V1.44643ZM1.44643 10.2127V16.5536H16.5536V9.0881L14.9827 7.29332L10.9961 11.9619L7.03286 7.3207L3.12068 12.1842L1.44643 10.2127ZM0 1.44643C0 0.647588 0.647588 0 1.44643 0H16.5536C17.3524 0 18 0.647588 18 1.44643V16.5536C18 17.3524 17.3524 18 16.5536 18H1.44643C0.647588 18 0 17.3524 0 16.5536V1.44643Z"
			fill="currentColor"
		/>
	</svg>
);
