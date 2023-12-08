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
		<g className="orthographic-o">
			<rect className="highlight" x="0.632812" y="4.42969" width="12.9375" height="12.9375" fill="currentColor" />
			<g className="primary">
				<path
					d="M3.79688 10.5205V7.4707H5.0625V10.5205H3.79688Z"
					fill="currentColor"
				/>
				<path
					d="M3.77557 15.1193L4.69176 14.2031H5.95166V12.9375H5.0625V12.0454H3.79688V13.3082L2.88064 14.2244L3.77557 15.1193Z"
					fill="currentColor"
				/>
				<path
					d="M10.5176 14.2031H7.47363V12.9375H10.5176V14.2031Z"
					fill="currentColor"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M3.98222 0.185346C4.09674 0.07083 4.25494 0 4.42969 0H17.3672C17.7167 0 18 0.28332 18 0.632812V13.5703C18 13.7473 17.9274 13.9073 17.8103 14.0221L14.0221 17.8103C13.9072 17.9274 13.7472 18 13.5703 18H0.632812C0.28332 18 0 17.7167 0 17.3672V4.42969C0 4.25494 0.07083 4.09674 0.185346 3.98222L0.185326 3.9822L3.9822 0.185326L3.98222 0.185346ZM2.16052 3.79688H3.79688V2.16052L2.16052 3.79688ZM5.0625 3.79688H13.3082L15.8394 1.26562H5.0625V3.79688ZM14.2031 4.69177V12.9375H16.7344V2.16052L14.2031 4.69177ZM14.2031 14.2031V15.8394L15.8394 14.2031H14.2031ZM3.79688 5.0625V5.9458H5.0625V5.0625H12.9375V12.9375H12.0396V14.2031H12.9375V16.7344H2.16051L2.67401 16.2209L1.77908 15.326L1.26562 15.8394V5.0625H3.79688Z"
					fill="currentColor"
				/>
			</g>
		</g>
	</svg>
);
