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
	className?: string;
};

export default ({ className }: IProps) => (
	<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10.6245 3.47381L9.17337 2.05629L2.43182 8.79781L2.16774 10.4962L3.86617 10.2322L10.6245 3.47381ZM4.03342 11.3078C4.26161 11.2723 4.4726 11.1652 4.63589 11.0019L11.3943 4.24353C11.8229 3.8149 11.8188 3.11869 11.3852 2.69511L9.93402 1.27759C9.50752 0.860979 8.82524 0.864979 8.40365 1.28656L1.6621 8.02809C1.4988 8.19138 1.39167 8.40237 1.35619 8.63057L0.863277 11.8007L4.03342 11.3078Z"
			fill="currentColor"
		/>
	</svg>
);
