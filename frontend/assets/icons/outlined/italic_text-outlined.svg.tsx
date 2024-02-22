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
	<svg width="11" height="15" viewBox="0 0 11 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M4.03446 1.38281C4.03446 1.03332 4.31778 0.75 4.66727 0.75L9.9045 0.749999C10.254 0.749999 10.5373 1.03332 10.5373 1.38281C10.5373 1.7323 10.254 2.01562 9.9045 2.01562L7.76337 2.01562L4.63307 12.9844L6.41302 12.9844C6.76251 12.9844 7.04583 13.2677 7.04583 13.6172C7.04583 13.9667 6.76251 14.25 6.41302 14.25L1.17578 14.25C0.82629 14.25 0.54297 13.9667 0.54297 13.6172C0.54297 13.2677 0.82629 12.9844 1.17578 12.9844L3.31692 12.9844L6.44722 2.01562L4.66727 2.01562C4.31778 2.01562 4.03446 1.7323 4.03446 1.38281Z" fill="currentColor"/>
	</svg>
);
