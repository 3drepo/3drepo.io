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
			<path className="primary" fill-rule="evenodd" clip-rule="evenodd" d="M9.16388 4.61188L3.79431 13.5589H14.5334L9.16388 4.61188ZM8.61224 3.07157C8.86213 2.65518 9.46562 2.65518 9.71552 3.07157L16.1843 13.8501C16.4417 14.279 16.1327 14.8245 15.6326 14.8245H2.69513C2.19495 14.8245 1.88617 14.2788 2.14349 13.8501L8.61224 3.07157Z" fill="currentColor"/>
			<path className="highlight" d="M7.62839 0.509766C7.53131 0.509766 7.45261 0.588466 7.45261 0.685547V3.49805C7.45261 3.59513 7.53131 3.67383 7.62839 3.67383H8.43695V10.605L3.25146 13.5837L2.86529 12.9306C2.81588 12.847 2.70808 12.8193 2.62451 12.8687L0.203532 14.3002C0.119965 14.3496 0.0922751 14.4574 0.141685 14.541L1.57312 16.9619C1.62253 17.0455 1.73033 17.0732 1.8139 17.0238L4.23488 15.5923C4.31844 15.5429 4.34613 15.4351 4.29672 15.3516L3.89566 14.6733L9.07118 11.7003L14.2522 14.692L13.7999 15.457C13.7505 15.5406 13.7782 15.6484 13.8617 15.6978L16.2827 17.1292C16.3663 17.1787 16.4741 17.151 16.5235 17.0674L17.9549 14.6464C18.0043 14.5629 17.9766 14.4551 17.8931 14.4056L15.4721 12.9742C15.3885 12.9248 15.2807 12.9525 15.2313 13.0361L14.8964 13.6025L9.70258 10.6034V3.67383H10.4409C10.538 3.67383 10.6167 3.59513 10.6167 3.49805V0.685547C10.6167 0.588466 10.538 0.509766 10.4409 0.509766H7.62839Z" fill="currentColor"/>
		</g>
	</svg>
);
