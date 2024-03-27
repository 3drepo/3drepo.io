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
	<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>

		<path
			className="primary"
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9.80542 0.705078C4.77944 0.705078 0.705078 4.77944 0.705078 9.80542C0.705078 14.8314 4.77944 18.9058 9.80542 18.9058C12.0524 18.9058 14.11 18.0907 15.6972 16.7413L20.0346 21.0787C20.3229 21.367 20.7904 21.367 21.0787 21.0787C21.367 20.7904 21.367 20.3229 21.0787 20.0346L16.7413 15.6972C18.0907 14.11 18.9058 12.0523 18.9058 9.80542C18.9058 4.77944 14.8314 0.705078 9.80542 0.705078ZM2.18164 9.80542C2.18164 5.59492 5.59492 2.18164 9.80542 2.18164C14.0159 2.18164 17.4292 5.59492 17.4292 9.80542C17.4292 11.9072 16.5796 13.8092 15.2034 15.1891C13.8224 16.5737 11.9145 17.4292 9.80542 17.4292C5.59492 17.4292 2.18164 14.0159 2.18164 9.80542Z"
			fill="currentColor"
		/>

		<path
			className="highlight"
			d="M9.06714 12.1946C9.06714 12.6023 9.39768 12.9329 9.80542 12.9329C10.2132 12.9329 10.5437 12.6023 10.5437 12.1946V10.5437H12.1946C12.6023 10.5437 12.9329 10.2132 12.9329 9.80542C12.9329 9.39768 12.6023 9.06714 12.1946 9.06714H10.5437V7.41626C10.5437 7.00852 10.2132 6.67798 9.80542 6.67798C9.39768 6.67798 9.06714 7.00852 9.06714 7.41626V9.06714H7.41626C7.00852 9.06714 6.67798 9.39768 6.67798 9.80542C6.67798 10.2132 7.00852 10.5437 7.41626 10.5437H9.06714V12.1946Z"
			fill="currentColor"
		/>
	</svg>
);



