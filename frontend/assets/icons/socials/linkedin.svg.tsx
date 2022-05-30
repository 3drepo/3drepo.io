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
	<svg
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M7.64585 7.22028H11.0504V8.91611C11.5408 7.94078 12.7984 7.06445 14.6877 7.06445C18.3094 7.06445 19.1693 9.00595 19.1693 12.5681V19.1654H15.5026V13.3794C15.5026 11.3508 15.0122 10.2068 13.7637 10.2068C12.0321 10.2068 11.3125 11.4397 11.3125 13.3784V19.1654H7.64585V7.22028ZM1.35844 19.0095H5.0251V7.06445H1.35844V19.0095ZM5.55035 3.16953C5.55049 3.47687 5.48954 3.78116 5.37104 4.06474C5.25255 4.34831 5.07887 4.6055 4.8601 4.82137C4.4168 5.26194 3.81676 5.50855 3.19177 5.50703C2.56788 5.50661 1.96922 5.26063 1.52527 4.82228C1.3073 4.60568 1.13421 4.3482 1.01592 4.06459C0.897631 3.78098 0.836468 3.47682 0.835938 3.16953C0.835938 2.54895 1.08344 1.95495 1.52619 1.51678C1.96975 1.07784 2.56866 0.831757 3.19269 0.832031C3.81785 0.832031 4.41735 1.07861 4.8601 1.51678C5.30194 1.95495 5.55035 2.54895 5.55035 3.16953Z"
			fill="currentColor"
		/>
	</svg>
);
