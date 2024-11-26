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
		<path d="M1.9944 0.657795C1.72272 0.521951 1.39235 0.632074 1.2565 0.903762C1.12066 1.17545 1.23078 1.50582 1.50247 1.64166L6.0186 3.89973L1.50247 6.15779C1.23078 6.29364 1.12066 6.62401 1.2565 6.8957C1.39235 7.16739 1.72272 7.27751 1.9944 7.14166L7.49441 4.39166C7.68074 4.2985 7.79844 4.10805 7.79844 3.89973C7.79844 3.69141 7.68074 3.50096 7.49441 3.40779L1.9944 0.657795Z" fill="currentColor"/>
		<path d="M1.19844 8.18972C0.894681 8.18972 0.648438 8.43596 0.648438 8.73972C0.648438 9.04347 0.894681 9.28972 1.19844 9.28972H7.79844C8.1022 9.28972 8.34844 9.04347 8.34844 8.73972C8.34844 8.43596 8.1022 8.18972 7.79844 8.18972H1.19844Z" fill="currentColor"/>
	</svg>
);