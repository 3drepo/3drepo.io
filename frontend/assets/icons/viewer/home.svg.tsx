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
		<g className="home-o" clipPath="url(#clip0_1764_3857)">
			<g className="primary">
				<path
					d="M0.302969 6.15713C0.00473802 6.33935 -0.0893098 6.72883 0.0929077 7.02706C0.275125 7.32529 0.664606 7.41934 0.962837 7.23712L8.6335 2.5504C8.85855 2.41289 9.14163 2.41289 9.36668 2.5504L17.0373 7.23712C17.3356 7.41934 17.7251 7.32529 17.9073 7.02706C18.0895 6.72883 17.9954 6.33935 17.6972 6.15713L10.0266 1.4704C9.3964 1.08539 8.60378 1.08539 7.97363 1.4704L0.302969 6.15713Z"
					fill="currentColor"
				/>
				<path
					d="M2.88292 8.99986C2.88292 8.65036 2.5996 8.36704 2.2501 8.36704C1.90061 8.36704 1.61729 8.65036 1.61729 8.99986V15.0467C1.61729 16.134 2.49873 17.0155 3.58604 17.0155H6.15245C6.85143 17.0155 7.41807 16.4488 7.41807 15.7499V9.63267H10.6261V15.7499C10.6261 16.4488 11.1927 17.0155 11.8917 17.0155H14.4142C15.5015 17.0155 16.3829 16.134 16.3829 15.0467V8.99986C16.3829 8.65036 16.0996 8.36704 15.7501 8.36704C15.4006 8.36704 15.1173 8.65036 15.1173 8.99986V15.0467C15.1173 15.4351 14.8025 15.7499 14.4142 15.7499H11.8917V9.63267C11.8917 8.93368 11.3251 8.36704 10.6261 8.36704H7.41807C6.71909 8.36704 6.15245 8.93368 6.15245 9.63267V15.7499H3.58604C3.19772 15.7499 2.88292 15.4351 2.88292 15.0467V8.99986Z"
					fill="currentColor"
				/>
			</g>
		</g>
		<defs>
			<clipPath className="clip0_1764_3857">
				<rect width="18" height="18" fill="currentColor" />
			</clipPath>
		</defs>
	</svg>
);
