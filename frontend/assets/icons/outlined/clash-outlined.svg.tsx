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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M3.61543 0.731446C3.77511 0.627694 3.97644 0.611777 4.15044 0.68915L11.7521 4.06935L15.2631 1.69715C15.5744 1.48681 15.9942 1.70985 15.9942 2.08556V3.31178C15.9942 3.62468 15.8381 3.91695 15.5781 4.09095L12.6406 6.05641V14.7969C12.6406 14.9874 12.5442 15.165 12.3844 15.2687C12.2246 15.3724 12.0231 15.3882 11.8491 15.3106L4.44053 12.0081L0.913388 14.4935C0.607054 14.7093 0.18382 14.4962 0.174772 14.1216L0.14505 12.8909C0.137495 12.5781 0.286494 12.2822 0.542269 12.102L3.3594 10.1169V1.20313C3.3594 1.0127 3.45574 0.835199 3.61543 0.731446ZM11.5156 13.9303L5.5112 11.2536L8.28922 9.29612L8.22622 6.68751L4.4844 9.32416V2.06886L11.5156 5.19542V13.9303Z" fill="currentColor"/>
	</svg>
);
