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
	<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
		<path
			d="M6.26316 10.4737H1.31579C1.23204 10.4737 1.15171 10.4404 1.09249 10.3812C1.03327 10.322 1 10.2416 1 10.1579V1.31579C1 1.23204 1.03327 1.15171 1.09249 1.09249C1.15171 1.03327 1.23204 1 1.31579 1H10.1579C10.2416 1 10.322 1.03327 10.3812 1.09249C10.4404 1.15171 10.4737 1.23204 10.4737 1.31579V6.26316"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M1 7.84226L4.68421 6.26331L7.57895 7.5791M7.84211 9.42121H9.42105M11 9.42121H9.42105M9.42105 9.42121V7.84226M9.42105 9.42121V11.0002M7.84211 4.68436C7.56293 4.68436 7.29519 4.57346 7.09778 4.37606C6.90038 4.17865 6.78947 3.91091 6.78947 3.63173C6.78947 3.35256 6.90038 3.08482 7.09778 2.88741C7.29519 2.69 7.56293 2.5791 7.84211 2.5791C8.12128 2.5791 8.38902 2.69 8.58643 2.88741C8.78383 3.08482 8.89474 3.35256 8.89474 3.63173C8.89474 3.91091 8.78383 4.17865 8.58643 4.37606C8.38902 4.57346 8.12128 4.68436 7.84211 4.68436V4.68436Z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
