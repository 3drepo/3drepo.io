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
	<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g id="move-cube-o">
			<path className="primary" fill-rule="evenodd" clip-rule="evenodd" d="M9.07185 2.8855C9.23817 2.8116 9.42801 2.8116 9.59432 2.8855L10.5583 3.31385C13.9613 4.82589 16.1544 8.20029 16.1544 11.924V13.7667C16.1544 14.0209 16.0047 14.2514 15.7723 14.3546L13.1589 15.5159C10.7232 16.5981 7.94301 16.5981 5.5073 15.5159L2.89384 14.3546C2.66149 14.2514 2.51172 14.021 2.51172 13.7667V11.924C2.51172 8.20029 4.70488 4.82589 8.10782 3.31385L9.07185 2.8855ZM9.33308 4.15437L8.62173 4.47044C5.6759 5.77937 3.77734 8.7005 3.77734 11.924V13.3623L6.02121 14.3593C8.12974 15.2962 10.5364 15.2962 12.645 14.3593L14.8888 13.3623V11.924C14.8888 8.70049 12.9903 5.77937 10.0444 4.47044L9.33308 4.15437Z" fill="currentColor"/>
			<path className="highlight" fill-rule="evenodd" clip-rule="evenodd" d="M9.03053 0.509766C8.1568 0.509766 7.4485 1.21807 7.4485 2.0918C7.4485 2.74729 7.84715 3.30967 8.41523 3.54971V10.605L3.1189 13.6473C2.62645 13.3051 1.95987 13.2593 1.40991 13.5845C0.657808 14.0291 0.408601 14.9993 0.853291 15.7514C1.29798 16.5035 2.26817 16.7527 3.02028 16.3081C3.58696 15.973 3.86815 15.3396 3.78212 14.7259L8.94428 11.7607L14.3031 14.855C14.2275 15.4613 14.5087 16.0828 15.0681 16.4135C15.8202 16.8582 16.7904 16.609 17.2351 15.8569C17.6798 15.1048 17.4306 14.1346 16.6785 13.6899C16.1211 13.3604 15.4439 13.4119 14.9496 13.7669L9.68085 10.7245V3.53441C10.2302 3.28637 10.6126 2.73373 10.6126 2.0918C10.6126 1.21807 9.90426 0.509766 9.03053 0.509766ZM9.05947 10.9688L9.07896 11.0027L9.09855 10.9688H9.05947Z" fill="currentColor"/>
		</g>
	</svg>
);