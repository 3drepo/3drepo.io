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
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
		<path
			d="M15.4899 7.76906L0.552374 0.279773C0.49166 0.249416 0.422017 0.242273 0.355945 0.258345C0.282616 0.276473 0.219457 0.322919 0.180299 0.387514C0.14114 0.452109 0.129173 0.529588 0.147017 0.602988L1.6863 6.89227C1.70952 6.98692 1.77916 7.0637 1.87202 7.09406L4.50952 7.99942L1.8738 8.90477C1.78095 8.93692 1.7113 9.01192 1.68987 9.10656L0.147017 15.4048C0.130945 15.4708 0.138088 15.5405 0.168445 15.5994C0.238088 15.7405 0.409517 15.7976 0.552374 15.728L15.4899 8.28156C15.5452 8.25477 15.5899 8.20834 15.6184 8.15477C15.6881 8.01192 15.6309 7.84049 15.4899 7.76906ZM1.90773 13.6155L2.80595 9.94406L8.07737 8.13513C8.11844 8.12084 8.15237 8.0887 8.16666 8.04584C8.19166 7.97084 8.15237 7.89049 8.07737 7.8637L2.80595 6.05656L1.9113 2.39942L13.1256 8.02263L1.90773 13.6155V13.6155Z"
			fill="currentColor"
		/>
	</svg>
);
