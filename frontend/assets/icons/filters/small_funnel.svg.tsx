/**
 *  Copyright (C) 2025 3D Repo Ltd
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
	filled?: boolean
};

export default ({ className, filled }: IProps) => (
	<svg className={className}  width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path 
			d="M1.0086 1H6.99127C6.99602 1 6.99987 1.00385 6.99987 1.0086L7 1.99644C7 1.99872 6.99909 2.00091 6.99748 2.00252L4.66911 4.33081C4.66749 4.33243 4.66659 4.33462 4.66659 4.3369L4.66659 6.98898C4.66659 6.99458 4.66133 6.99869 4.6559 6.99733L3.3398 6.6683C3.33597 6.66734 3.33328 6.6639 3.33328 6.65995L3.33328 4.3369C3.33328 4.33461 3.33238 4.33243 3.33076 4.33081L1.00252 2.00252C1.00091 2.00091 1 1.99872 1 1.99644V1.0086C1 1.00385 1.00385 1 1.0086 1Z" 
			fill={filled ? 'currentColor' : 'none'} 
			stroke="currentColor" 
			strokeLinecap="round" 
			strokeLinejoin="round"
		/>
	</svg>
);