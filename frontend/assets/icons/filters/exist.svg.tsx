/**
 *  Copyright (C) 2024 3D Repo Ltd
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
	<svg className={className} width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M6.79859 0.809766C6.79859 0.506009 6.55235 0.259766 6.24859 0.259766H0.858594C0.554837 0.259766 0.308594 0.506009 0.308594 0.809766C0.308594 1.11352 0.554837 1.35977 0.858594 1.35977H5.69859V3.44977H1.57048C1.26672 3.44977 1.02048 3.69601 1.02048 3.99977C1.02048 4.30352 1.26672 4.54977 1.57048 4.54977H5.69859V6.63977H0.858594C0.554837 6.63977 0.308594 6.88601 0.308594 7.18976C0.308594 7.49352 0.554837 7.73977 0.858594 7.73977H6.24859C6.55235 7.73977 6.79859 7.49352 6.79859 7.18976V0.809766Z" fill="currentColor"/>
	</svg>
);