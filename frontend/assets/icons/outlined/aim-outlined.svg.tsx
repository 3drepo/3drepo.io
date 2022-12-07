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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 16 14" fill="none" className={className}>
		<path d="M11.8929 5.49107H10.2563C10.0246 3.53036 8.46964 1.97545 6.50893 1.74375V0.107143C6.50893 0.0482143 6.46071 0 6.40179 0H5.59821C5.53929 0 5.49107 0.0482143 5.49107 0.107143V1.74375C3.53036 1.97545 1.97545 3.53036 1.74375 5.49107H0.107143C0.0482143 5.49107 0 5.53929 0 5.59821V6.40179C0 6.46071 0.0482143 6.50893 0.107143 6.50893H1.74375C1.97545 8.46964 3.53036 10.0246 5.49107 10.2563V11.8929C5.49107 11.9518 5.53929 12 5.59821 12H6.40179C6.46071 12 6.50893 11.9518 6.50893 11.8929V10.2563C8.46964 10.0246 10.0246 8.46964 10.2563 6.50893H11.8929C11.9518 6.50893 12 6.46071 12 6.40179V5.59821C12 5.53929 11.9518 5.49107 11.8929 5.49107ZM6 9.26786C4.19464 9.26786 2.73214 7.80536 2.73214 6C2.73214 4.19464 4.19464 2.73214 6 2.73214C7.80536 2.73214 9.26786 4.19464 9.26786 6C9.26786 7.80536 7.80536 9.26786 6 9.26786Z" fill="currentColor" />
		<path d="M6.0002 4.3945C5.57029 4.3945 5.16851 4.56057 4.86449 4.86593C4.56047 5.16994 4.39306 5.57173 4.39306 6.00164C4.39306 6.43155 4.56047 6.83334 4.86449 7.13736C5.16851 7.44003 5.57163 7.60878 6.0002 7.60878C6.42878 7.60878 6.8319 7.44137 7.13592 7.13736C7.4386 6.83334 7.60735 6.43021 7.60735 6.00164C7.60735 5.57307 7.43994 5.16994 7.13592 4.86593C6.98746 4.71579 6.81055 4.59677 6.61554 4.51582C6.42054 4.43487 6.21134 4.39363 6.0002 4.3945Z" fill="currentColor" />
	</svg>
);
