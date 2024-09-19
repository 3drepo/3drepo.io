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
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
		<path
			d="M3.51562 0C1.574 0 0 1.574 0 3.51562V16.4844C0 18.426 1.574 20 3.51562 20H16.4844C18.426 20 20 18.426 20 16.4844V15.6934H18.5938V16.4844C18.5938 17.6493 17.6493 18.5938 16.4844 18.5938H12.0117V15.7031H10.6055V18.5938H3.51562C2.35065 18.5938 1.40625 17.6493 1.40625 16.4844V12.207H6.50391V16.377H7.91016V9.98047H6.50391V10.8008H1.40625V3.51562C1.40625 2.35065 2.35065 1.40625 3.51562 1.40625H6.50391L6.50391 7.79297H7.91016L7.91016 1.40625H16.4844C17.6493 1.40625 18.5938 2.35065 18.5938 3.51562V6.46484L10.6055 6.46484L10.6055 13.3203L12.0117 13.3203L12.0117 7.87109L18.5938 7.87109V13.3691H20V3.51562C20 1.574 18.426 0 16.4844 0H3.51562Z"
			fill="currentColor"/>
	</svg>
);
