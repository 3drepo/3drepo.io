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
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none" className={className}>
		<path
			d="M9 1.625C4.65117 1.625 1.125 5.15117 1.125 9.5C1.125 13.8488 4.65117 17.375 9 17.375C13.3488 17.375 16.875 13.8488 16.875 9.5C16.875 5.15117 13.3488 1.625 9 1.625ZM9 16.0391C5.38945 16.0391 2.46094 13.1105 2.46094 9.5C2.46094 5.88945 5.38945 2.96094 9 2.96094C12.6105 2.96094 15.5391 5.88945 15.5391 9.5C15.5391 13.1105 12.6105 16.0391 9 16.0391Z"
			fill="currentColor"
		/>
		<path
			d="M12.6453 9.27283L7.4404 5.49353C7.39865 5.46293 7.34923 5.44452 7.29764 5.44036C7.24605 5.4362 7.19431 5.44644 7.1482 5.46995C7.10209 5.49346 7.06341 5.52932 7.03648 5.57352C7.00955 5.61772 6.99542 5.66853 6.99567 5.72029L6.99567 13.2789C6.99567 13.5092 7.25583 13.6392 7.4404 13.5056L12.6453 9.72634C12.6812 9.70045 12.7105 9.66638 12.7307 9.62696C12.7509 9.58753 12.7614 9.54388 12.7614 9.49958C12.7614 9.45529 12.7509 9.41163 12.7307 9.37221C12.7105 9.33278 12.6812 9.29872 12.6453 9.27283ZM8.11715 11.6283V7.37087L11.0474 9.49958L8.11715 11.6283Z"
			fill="currentColor"
		/>
	</svg>
);
