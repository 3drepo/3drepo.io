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
	className?: string;
};

export default ({ className }: IProps) => (
	<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<rect width="30" height="30" rx="15" fill="currentColor"/>
		<path d="M15.5573 8.05728C15.5573 7.7495 15.3078 7.5 15 7.5C14.6923 7.5 14.4428 7.7495 14.4428 8.05728L14.4428 14.4427L8.0573 14.4427C7.74953 14.4427 7.50003 14.6922 7.50003 15C7.50003 15.3078 7.74953 15.5573 8.0573 15.5573L14.4428 15.5573L14.4428 21.9427C14.4428 22.2505 14.6923 22.5 15 22.5C15.3078 22.5 15.5573 22.2505 15.5573 21.9427L15.5573 15.5573L21.9428 15.5573C22.2505 15.5573 22.5 15.3078 22.5 15C22.5 14.6922 22.2505 14.4427 21.9428 14.4427L15.5573 14.4427L15.5573 8.05728Z" fill="white"/>
	</svg>
);
