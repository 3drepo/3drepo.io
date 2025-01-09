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
	<svg className={className} width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M0.648438 8.85008C0.648438 8.54633 0.894681 8.30008 1.19844 8.30008H7.79844C8.10219 8.30008 8.34844 8.54633 8.34844 8.85008C8.34844 9.15384 8.10219 9.40008 7.79844 9.40008H1.19844C0.894681 9.40008 0.648438 9.15384 0.648438 8.85008Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M7.74037 1.01411C7.60453 0.742426 7.27416 0.632302 7.00247 0.768146L1.50247 3.51815C1.31614 3.61131 1.19844 3.80176 1.19844 4.01008C1.19844 4.21841 1.31614 4.40885 1.50247 4.50202L7.00247 7.25202C7.27416 7.38786 7.60453 7.27774 7.74037 7.00605C7.87622 6.73436 7.76609 6.40399 7.49441 6.26815L2.97828 4.01008L7.49441 1.75202C7.76609 1.61617 7.87622 1.2858 7.74037 1.01411Z" fill="currentColor"/>
	</svg>
);