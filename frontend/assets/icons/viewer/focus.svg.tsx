/**
 *  Copyright (C) 2023 3D Repo Ltd
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
	<svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g className="move-cube-o">
			<path
				className="primary"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9.26016 3.6775C9.09383 3.60359 8.90399 3.6036 8.73768 3.6775L4.24931 5.67182C4.01694 5.77507 3.86719 6.00549 3.86719 6.25976V11.7433C3.86719 11.9976 4.01695 12.228 4.24931 12.3313L8.73768 14.3256C8.90399 14.3995 9.09383 14.3995 9.26016 14.3256L13.7485 12.3313C13.9809 12.228 14.1307 11.9976 14.1307 11.7433V6.25976C14.1307 6.00549 13.9809 5.77507 13.7485 5.67182L9.26016 3.6775ZM6.05668 6.25369L8.99892 4.94636L11.9412 6.25371L8.99895 7.56074L6.05668 6.25369Z"
				fill="currentColor"
			/>
			<g className="primary">
				<path
					fill="currentColor"
					d="M0.808594 0C0.36202 0 0 0.362019 0 0.808594V5.90625H1.26562V1.26562H5.90625V0H0.808594Z"
				/>
				<path
					fill="currentColor"
					d="M17.1914 18.0352C17.638 18.0352 18 17.6731 18 17.2266V12.1289H16.7344V16.7695H12.0938V18.0352H17.1914Z"
				/>
				<path
					fill="currentColor"
					d="M18 0.808594C18 0.362019 17.638 0 17.1914 0H12.0938V1.26562H16.7344V5.90625H18V0.808594Z"
				/>
				<path
					fill="currentColor"
					d="M0.808594 18.0352C0.36202 18.0352 0 17.6731 0 17.2266V12.1289H1.26562V16.7695H5.90625V18.0352H0.808594Z"
				/>
			</g>
		</g>
	</svg>
);
