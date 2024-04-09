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
	<svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path 
			fillRule="evenodd" 
			clipRule="evenodd" 
			d="M7.95333 2.58028C7.7062 2.82741 7.30552 2.82741 7.05839 2.58028C6.81126 2.33315 6.81126 1.93247 7.05839 1.68535L8.55839 0.185346C8.67707 0.0666711 8.83803 0 9.00586 0C9.17369 0 9.33465 0.0666711 9.45333 0.185346L10.9533 1.68535C11.2005 1.93248 11.2005 2.33315 10.9533 2.58028C10.7062 2.82741 10.3055 2.82741 10.0584 2.58028L9.61576 2.13765L9.62621 9.32885L17.5953 12.9741C17.8205 13.0771 17.965 13.3021 17.9648 13.5499C17.9647 13.7976 17.82 14.0225 17.5946 14.1253L9.26259 17.9254C9.0958 18.0014 8.9042 18.0014 8.73741 17.9254L0.405376 14.1253C0.179977 14.0225 0.0352935 13.7976 0.0351563 13.5499C0.0350193 13.3021 0.179454 13.0771 0.404739 12.9741L8.3606 9.33488L8.3502 2.1834L7.95333 2.58028ZM2.19111 13.5487L8.36262 10.7257L8.36719 13.8701C8.3677 14.2196 8.65143 14.5025 9.00092 14.502C9.35041 14.5014 9.63332 14.2177 9.63281 13.8682L9.62824 10.7215L15.8089 13.5487L9 16.6541L2.19111 13.5487Z" 
			fill="currentColor"
		/>
	</svg>
);


