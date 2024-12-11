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
		<path fillRule="evenodd" clipRule="evenodd" d="M0.308594 3.99977C0.308594 1.93422 1.98305 0.259766 4.04859 0.259766H6.24859C6.55235 0.259766 6.79859 0.506009 6.79859 0.809766C6.79859 1.11352 6.55235 1.35977 6.24859 1.35977H4.04859C2.77917 1.35977 1.719 2.25572 1.46597 3.44977H5.53671C5.84046 3.44977 6.08671 3.69601 6.08671 3.99977C6.08671 4.30352 5.84046 4.54977 5.53671 4.54977H1.46597C1.719 5.74381 2.77917 6.63977 4.04859 6.63977H6.24859C6.55235 6.63977 6.79859 6.88601 6.79859 7.18976C6.79859 7.49352 6.55235 7.73977 6.24859 7.73977H4.04859C1.98305 7.73977 0.308594 6.06531 0.308594 3.99977Z" fill="currentColor"/>
	</svg>
);