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
		<path fillRule="evenodd" clipRule="evenodd" d="M6.7426 1.00435C6.60675 0.73266 6.27638 0.622537 6.00469 0.758381L0.504694 3.50838C0.318362 3.60155 0.200661 3.79199 0.200661 4.00032C0.200661 4.20864 0.318362 4.39909 0.504694 4.49225L6.00469 7.24225C6.27638 7.3781 6.60675 7.26797 6.7426 6.99628C6.87844 6.7246 6.76832 6.39423 6.49663 6.25838L1.9805 4.00032L6.49663 1.74225C6.76832 1.60641 6.87844 1.27604 6.7426 1.00435Z" fill="currentColor"/>
	</svg>
);