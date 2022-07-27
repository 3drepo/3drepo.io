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
	<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			d="M35.875 29.391L33.4442 20.829V2.18611C33.4442 1.47494 32.8696 0.900391 32.1585 0.900391H3.87276C3.1616 0.900391 2.58704 1.47494 2.58704 2.18611V20.829L0.156239 29.391C-0.1451 30.2307 0.47365 31.1147 1.36561 31.1147H34.6656C35.5576 31.1147 36.1763 30.2307 35.875 29.391ZM5.4799 3.79325H30.5513V19.6638H5.4799V3.79325ZM14.6527 28.2218L14.9781 26.7352H21.017L21.3424 28.2218H14.6527ZM23.6527 28.2218L22.8853 24.7383C22.8531 24.5897 22.7205 24.4852 22.5719 24.4852H13.4272C13.2745 24.4852 13.146 24.5897 13.1138 24.7383L12.3464 28.2218H3.49508L5.19463 22.2352H30.8366L32.5361 28.2218H23.6527Z"
			fill="currentColor"
		/>
	</svg>
);
