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
	<svg className={className} width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M0.648438 1.3498C0.648438 1.04605 0.894681 0.799805 1.19844 0.799805H7.79844C8.10219 0.799805 8.34844 1.04605 8.34844 1.3498C8.34844 1.65356 8.10219 1.8998 7.79844 1.8998H1.19844C0.894681 1.8998 0.648438 1.65356 0.648438 1.3498Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M0.648438 4.6498C0.648438 4.34605 0.894681 4.0998 1.19844 4.0998H7.79844C8.10219 4.0998 8.34844 4.34605 8.34844 4.6498C8.34844 4.95356 8.10219 5.1998 7.79844 5.1998H1.19844C0.894681 5.1998 0.648438 4.95356 0.648438 4.6498Z" fill="currentColor"/>
	</svg>
);