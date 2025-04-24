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
		<path fillRule="evenodd" clipRule="evenodd" d="M6.59821 1.01239C6.7651 0.758586 6.69463 0.417548 6.44083 0.250662C6.18702 0.0837767 5.84599 0.154239 5.6791 0.408044L5.11877 1.26021H4.04865C1.98311 1.26021 0.308654 2.93466 0.308654 5.00021C0.308654 5.88267 0.614283 6.69375 1.12546 7.33336L0.3991 8.43804C0.232214 8.69185 0.302676 9.03289 0.556482 9.19977C0.810287 9.36666 1.15133 9.2962 1.31821 9.04239L1.94328 8.09176C2.54298 8.50096 3.26788 8.74021 4.04865 8.74021H6.24865C6.55241 8.74021 6.79865 8.49397 6.79865 8.19021C6.79865 7.88645 6.55241 7.64021 6.24865 7.64021H4.04865C3.49112 7.64021 2.97396 7.46738 2.54781 7.17238L3.61444 5.55021H5.53677C5.84052 5.55021 6.08677 5.30397 6.08677 5.00021C6.08677 4.69645 5.84052 4.45021 5.53677 4.45021H4.33773L5.71197 2.36021H6.24865C6.55241 2.36021 6.79865 2.11397 6.79865 1.81021C6.79865 1.56548 6.63881 1.35808 6.41783 1.28672L6.59821 1.01239ZM4.39548 2.36021H4.04865C2.77923 2.36021 1.71907 3.25617 1.46603 4.45021H3.02124L4.39548 2.36021ZM2.29795 5.55021H1.46603C1.52626 5.83445 1.63224 6.1018 1.77588 6.34419L2.29795 5.55021Z" fill="currentColor"/>
	</svg>
);