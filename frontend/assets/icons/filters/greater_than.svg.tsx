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
		<path fillRule="evenodd" clipRule="evenodd" d="M0.257404 1.00435C0.393248 0.73266 0.723619 0.622537 0.995307 0.758381L6.49531 3.50838C6.68164 3.60155 6.79934 3.79199 6.79934 4.00032C6.79934 4.20864 6.68164 4.39909 6.49531 4.49225L0.995307 7.24225C0.723619 7.37809 0.393248 7.26797 0.257404 6.99628C0.12156 6.7246 0.231684 6.39422 0.503372 6.25838L5.0195 4.00032L0.503372 1.74225C0.231684 1.60641 0.12156 1.27604 0.257404 1.00435Z" fill="currentColor"/>
	</svg>
);