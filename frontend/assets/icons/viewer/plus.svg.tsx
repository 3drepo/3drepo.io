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
			d="M9.66874 0.66873C9.66874 0.2994 9.36934 0 9.00001 0C8.63068 0 8.33128 0.2994 8.33128 0.66873V8.33129H0.668731C0.299402 8.33129 0 8.63069 0 9.00002C0 9.36935 0.299402 9.66875 0.668731 9.66875L8.33128 9.66875V17.3313C8.33128 17.7006 8.63068 18 9.00001 18C9.36934 18 9.66874 17.7006 9.66874 17.3313V9.66875L17.3313 9.66875C17.7006 9.66875 18 9.36935 18 9.00002C18 8.63069 17.7006 8.33129 17.3313 8.33129H9.66874V0.66873Z"
			fill="currentColor"
		/>
	</svg>
);
