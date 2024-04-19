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
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g className="info-o">
			<path className="primary"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9 16.7344C13.2716 16.7344 16.7344 13.2716 16.7344 9C16.7344 4.72842 13.2716 1.26562 9 1.26562C4.72842 1.26562 1.26562 4.72842 1.26562 9C1.26562 13.2716 4.72842 16.7344 9 16.7344ZM9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18Z"
				fill="currentColor"
			/>
			<g className="primary">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M9 6.76758C9.34949 6.76758 9.63281 7.0509 9.63281 7.40039L9.63281 13.2715C9.63281 13.621 9.34949 13.9043 9 13.9043C8.65051 13.9043 8.36719 13.621 8.36719 13.2715L8.36719 7.40039C8.36719 7.0509 8.65051 6.76758 9 6.76758Z"
					fill="currentColor"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M9 4.11328C9.34949 4.11328 9.63281 4.3966 9.63281 4.74609V5.39648C9.63281 5.74598 9.34949 6.0293 9 6.0293C8.65051 6.0293 8.36719 5.74598 8.36719 5.39648V4.74609C8.36719 4.3966 8.65051 4.11328 9 4.11328Z"
					fill="currentColor"
				/>
			</g>
		</g>
	</svg>
);
