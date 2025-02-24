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
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			id="main"
			d="m 10.672,0.109375 c -3.2955383,3e-8 -5.967326,2.6712586 -5.9669219,5.9667969 C 4.7110313,8.9629326 6.6524586,11.431315 9.4945,11.9375 v 7.134766 L 10.693359,19.898438 11.85,18.892578 V 11.894531 C 14.572219,11.282898 16.637461,8.8662557 16.638672,6.0761719 16.639076,2.7806336 13.967538,0.10937497 10.672,0.109375 Z"
			fill="currentColor"/>
     
		<path
			d="m 10.977607,3.1040296 c 1.996699,0 2.928475,1.4097868 2.928475,2.5809942"
			fill="#ffffffcc"
		/>
	</svg>
);
