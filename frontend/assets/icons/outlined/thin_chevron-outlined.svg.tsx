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
	<svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none" className={className}>
		<path
			d="M1.2384 0.423752L0.116863 0.423752C0.019653 0.423752 -0.0340301 0.535471 0.0254565 0.610918L5.13405 7.15154C5.17727 7.20712 5.23261 7.25208 5.29585 7.28301C5.35908 7.31395 5.42855 7.33002 5.49895 7.33002C5.56935 7.33002 5.63882 7.31395 5.70206 7.28301C5.7653 7.25208 5.82063 7.20712 5.86385 7.15154L10.9724 0.610918C11.0319 0.53402 10.9782 0.423752 10.881 0.423752L9.7595 0.423752C9.6884 0.423752 9.62021 0.457122 9.57668 0.512256L5.49968 5.73547L1.42122 0.512257C1.37769 0.457122 1.3095 0.423752 1.2384 0.423752Z"
			fill="currentColor"
		/>
	</svg>
);
