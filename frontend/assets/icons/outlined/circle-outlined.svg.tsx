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
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
		<path fillRule="evenodd" clipRule="evenodd" d="M10 1.55078C5.33363 1.55078 1.55078 5.33363 1.55078 10C1.55078 14.6664 5.33363 18.4492 10 18.4492C14.6664 18.4492 18.4492 14.6664 18.4492 10C18.4492 5.33363 14.6664 1.55078 10 1.55078ZM0.0742188 10C0.0742188 4.51814 4.51814 0.0742188 10 0.0742188C15.4819 0.0742188 19.9258 4.51814 19.9258 10C19.9258 15.4819 15.4819 19.9258 10 19.9258C4.51814 19.9258 0.0742188 15.4819 0.0742188 10Z" fill="currentColor" />
	</svg>
);
