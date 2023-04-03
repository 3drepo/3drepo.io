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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg width="1024" height="861" viewBox="0 0 1024 861" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M87.04 0H10.24C4.608 0 0 4.608 0 10.24V849.92C0 855.552 4.608 860.16 10.24 860.16H87.04C92.672 860.16 97.28 855.552 97.28 849.92V10.24C97.28 4.608 92.672 0 87.04 0ZM1013.76 0H936.96C931.328 0 926.72 4.608 926.72 10.24V849.92C926.72 855.552 931.328 860.16 936.96 860.16H1013.76C1019.39 860.16 1024 855.552 1024 849.92V10.24C1024 4.608 1019.39 0 1013.76 0ZM861.824 420.224L698.496 291.328C697.129 290.253 695.488 289.585 693.759 289.4C692.03 289.215 690.284 289.521 688.721 290.282C687.158 291.044 685.841 292.23 684.921 293.705C684.001 295.181 683.516 296.885 683.52 298.624V384H340.48V303.616C340.48 295.936 331.52 291.584 325.504 296.32L162.176 425.344C161.071 426.198 160.176 427.294 159.56 428.548C158.945 429.801 158.625 431.179 158.625 432.576C158.625 433.973 158.945 435.351 159.56 436.604C160.176 437.858 161.071 438.954 162.176 439.808L325.376 568.832C331.392 573.568 340.352 569.344 340.352 561.536V476.16H683.392V556.544C683.392 564.224 692.352 568.576 698.368 563.84L861.568 434.816C866.432 431.104 866.432 423.936 861.824 420.224Z" fill="currentColor" />
	</svg>

);
