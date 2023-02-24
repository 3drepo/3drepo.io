/**
 *  Copyright (C) 2021 3D Repo Ltd
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
	<svg width="29" height="32" viewBox="0 0 29 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M19.7812 2.25H8.28125V4.875H19.7812V2.25ZM22.0312 4.875V2.25C22.0312 1.00736 21.0239 0 19.7812 0H8.28125C7.03861 0 6.03125 1.00736 6.03125 2.25V4.875H2.03125H1.125C0.50368 4.875 0 5.37868 0 6C0 6.62132 0.50368 7.125 1.125 7.125H2.12457L3.0668 29.8432C3.11679 31.0486 4.10849 32 5.31487 32H22.7476C23.954 32 24.9457 31.0486 24.9957 29.8432L25.9379 7.125H26.9375C27.5588 7.125 28.0625 6.62132 28.0625 6C28.0625 5.37868 27.5588 4.875 26.9375 4.875H26.0312H22.0312ZM23.686 7.125H19.7812H8.28125H4.3765L5.31487 29.75L22.7476 29.75L23.686 7.125Z"
			fill="currentColor"
		/>
	</svg>
);
