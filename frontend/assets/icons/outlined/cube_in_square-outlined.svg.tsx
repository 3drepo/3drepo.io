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
	<svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g clipPath="url(#clip0_213_7199)">
			<path fillRule="evenodd" clipRule="evenodd" d="M8.73768 3.67748C8.90399 3.60358 9.09383 3.60358 9.26016 3.67748L13.7485 5.67181C13.9809 5.77506 14.1307 6.00548 14.1307 6.25974V11.7433C14.1307 11.9976 13.9809 12.228 13.7485 12.3313L9.26016 14.3256C9.09383 14.3995 8.90399 14.3995 8.73768 14.3256L4.24931 12.3313C4.01695 12.228 3.86719 11.9976 3.86719 11.7433V6.25974C3.86719 6.00547 4.01694 5.77505 4.24931 5.67181L8.73768 3.67748ZM8.99892 4.94634L6.05666 6.25368L8.99892 7.56073L11.9412 6.25368L8.99892 4.94634ZM5.13281 11.3389V7.22817L8.3661 8.6645V12.7755L5.13281 11.3389ZM12.865 11.3389L9.63173 12.7755V8.6645L12.865 7.22817V11.3389Z" fill="currentColor"/>
			<path fillRule="evenodd" clipRule="evenodd" d="M3.16406 0C1.4166 0 0 1.4166 0 3.16406V14.8359C0 16.5834 1.4166 18 3.16406 18H14.8359C16.5834 18 18 16.5834 18 14.8359V3.16406C18 1.4166 16.5834 0 14.8359 0H3.16406ZM1.26562 3.16406C1.26562 2.11558 2.11558 1.26562 3.16406 1.26562H14.8359C15.8844 1.26562 16.7344 2.11558 16.7344 3.16406V14.8359C16.7344 15.8844 15.8844 16.7344 14.8359 16.7344H3.16406C2.11558 16.7344 1.26562 15.8844 1.26562 14.8359V3.16406Z" fill="currentColor"/>
		</g>
		<defs>
			<clipPath id="clip0_213_7199">
				<rect width="18" height="18" fill="currentColor"/>
			</clipPath>
		</defs>
	</svg>
);
