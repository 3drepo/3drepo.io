/**
 *  Copyright (C) 2023 3D Repo Ltd
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
			d="M17.5156 9.00879C17.5156 9.35828 17.2323 9.6416 16.8828 9.6416H1.11523C0.765741 9.6416 0.482422 9.35828 0.482422 9.00879C0.482422 8.6593 0.765741 8.37598 1.11523 8.37598H16.8828C17.2323 8.37598 17.5156 8.6593 17.5156 9.00879Z"
			fill="currentColor"
		/>
	</svg>
);
