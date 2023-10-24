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
	<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M6.4 5.5L5 5.5C2.79086 5.5 1 7.29086 1 9.5L1 13.2C1 15.4091 2.79086 17.2 5 17.2L15 17.2C17.2091 17.2 19 15.4091 19 13.2L19 9.5C19 7.29086 17.2091 5.5 15 5.5L13.6 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M7.29993 10L9.29282 11.9929C9.68334 12.3834 10.3165 12.3834 10.707 11.9929L12.6999 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M9.99988 11.8L9.99988 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
	</svg>
);
