/**
 *  Copyright (C) 2022 3D Repo Ltd
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
	<svg
		width="19"
		height="16"
		viewBox="0 0 19 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path
			d="M18.9217 1.8246C18.2258 2.13293 17.4783 2.34127 16.6925 2.43543C17.5033 1.95026 18.11 1.18665 18.3992 0.287099C17.6374 0.73959 16.8036 1.05809 15.9342 1.22877C15.3495 0.604486 14.5751 0.190704 13.7311 0.0516603C12.8872 -0.0873831 12.0209 0.0560916 11.2669 0.459809C10.5128 0.863527 9.91315 1.5049 9.56096 2.28435C9.20878 3.0638 9.12378 3.93772 9.31917 4.77043C7.77557 4.69293 6.26552 4.29172 4.88702 3.59285C3.50852 2.89398 2.29237 1.91307 1.3175 0.713765C0.984167 1.28877 0.7925 1.95543 0.7925 2.66543C0.792128 3.30459 0.949527 3.93397 1.25073 4.49771C1.55194 5.06145 1.98763 5.54213 2.51917 5.8971C1.90273 5.87748 1.29989 5.71092 0.760833 5.41127V5.46126C0.760771 6.35772 1.07086 7.22658 1.63849 7.92043C2.20611 8.61428 2.99631 9.09037 3.875 9.26793C3.30315 9.4227 2.70361 9.44549 2.12167 9.3346C2.36958 10.1059 2.8525 10.7805 3.50281 11.2637C4.15312 11.747 4.93826 12.0147 5.74833 12.0296C4.37319 13.1091 2.67491 13.6947 0.926667 13.6921C0.616984 13.6922 0.307564 13.6741 0 13.6379C1.77456 14.7789 3.84028 15.3844 5.95 15.3821C13.0917 15.3821 16.9958 9.4671 16.9958 4.3371C16.9958 4.17043 16.9917 4.0021 16.9842 3.83543C17.7436 3.28624 18.3991 2.60618 18.92 1.8271L18.9217 1.8246Z"
			fill="currentColor"
		/>
	</svg>
);
