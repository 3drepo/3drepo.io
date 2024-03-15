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
	<svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M18.7109 3.28906H3.28906L3.28906 18.7109H18.7109V3.28906ZM3.28906 1.8125C2.47358 1.8125 1.8125 2.47358 1.8125 3.28906V18.7109C1.8125 19.5264 2.47358 20.1875 3.28906 20.1875H18.7109C19.5264 20.1875 20.1875 19.5264 20.1875 18.7109V3.28906C20.1875 2.47358 19.5264 1.8125 18.7109 1.8125H3.28906Z" fill="currentColor"/>
	</svg>
);