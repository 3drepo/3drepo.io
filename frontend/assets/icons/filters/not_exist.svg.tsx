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
	<svg className={className} width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M6.48884 1.01239C6.65572 0.758586 6.58526 0.417548 6.33145 0.250662C6.07765 0.0837767 5.73661 0.154239 5.56973 0.408044L5.0094 1.26021H0.749286C0.445529 1.26021 0.199286 1.50645 0.199286 1.81021C0.199286 2.11397 0.445529 2.36021 0.749286 2.36021H4.28611L2.91186 4.45021H1.46117C1.15742 4.45021 0.911173 4.69645 0.911173 5.00021C0.911173 5.30397 1.15742 5.55021 1.46117 5.55021H2.18858L0.814328 7.64021H0.749286C0.445529 7.64021 0.199286 7.88645 0.199286 8.19021C0.199286 8.29042 0.226086 8.38437 0.272909 8.46528C0.128052 8.71575 0.202276 9.03879 0.447107 9.19977C0.700912 9.36666 1.04195 9.2962 1.20884 9.04239L1.40753 8.74021H6.13929C6.44304 8.74021 6.68929 8.49397 6.68929 8.19021V1.81021C6.68929 1.56548 6.52944 1.35808 6.30846 1.28672L6.48884 1.01239ZM5.58929 2.38046L4.22835 4.45021H5.58929V2.38046ZM3.50506 5.55021L2.13082 7.64021H5.58929V5.55021H3.50506Z" fill="currentColor"/>
	</svg>
);