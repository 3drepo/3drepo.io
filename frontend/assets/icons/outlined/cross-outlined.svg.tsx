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
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none" className={className}>
		<path d="M13.3361 2.05879C13.5833 1.81167 13.5833 1.41099 13.3361 1.16386C13.089 0.916733 12.6883 0.916733 12.4412 1.16386L6.99999 6.60508L1.5588 1.16389C1.31167 0.91676 0.910992 0.91676 0.663863 1.16389C0.416734 1.41102 0.416734 1.81169 0.663863 2.05882L6.10506 7.50002L0.657942 12.9471C0.410813 13.1943 0.410813 13.5949 0.657942 13.8421C0.90507 14.0892 1.30574 14.0892 1.55287 13.8421L6.99999 8.39495L12.4471 13.8421C12.6943 14.0892 13.0949 14.0892 13.3421 13.8421C13.5892 13.595 13.5892 13.1943 13.3421 12.9472L7.89492 7.50002L13.3361 2.05879Z" fill="currentColor"/>
	</svg>
);
