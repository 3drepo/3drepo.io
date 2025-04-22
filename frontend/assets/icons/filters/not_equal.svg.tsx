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
	<svg className={className} width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M8.18735 1.0893C8.40214 0.874511 8.40214 0.52627 8.18735 0.311482C7.97256 0.0966935 7.62432 0.0966935 7.40953 0.311482L5.92062 1.80039H1.19844C0.894681 1.80039 0.648438 2.04663 0.648438 2.35039C0.648438 2.65415 0.894681 2.90039 1.19844 2.90039H4.82062L2.62062 5.10039H1.19844C0.894681 5.10039 0.648438 5.34663 0.648438 5.65039C0.648438 5.95415 0.894681 6.20039 1.19844 6.20039H1.52062L0.809529 6.91148C0.59474 7.12627 0.59474 7.47451 0.809529 7.6893C1.02432 7.90409 1.37256 7.90409 1.58735 7.6893L3.07626 6.20039H7.79844C8.1022 6.20039 8.34844 5.95415 8.34844 5.65039C8.34844 5.34663 8.1022 5.10039 7.79844 5.10039H4.17626L6.37626 2.90039H7.79844C8.1022 2.90039 8.34844 2.65415 8.34844 2.35039C8.34844 2.04663 8.1022 1.80039 7.79844 1.80039H7.47626L8.18735 1.0893Z" fill="currentColor" />
	</svg>
);