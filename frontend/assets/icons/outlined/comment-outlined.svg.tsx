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
	<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M1.05227 12.4688C1.05227 12.4688 0 9.94427 0 8.5C0 4.08172 3.58172 0.5 8 0.5C12.4183 0.5 16 4.08172 16 8.5C16 12.9183 12.4183 16.5 8 16.5C6.59416 16.5 4.125 15.5006 4.125 15.5006L1.84827 16.096C1.01872 16.3129 0.261134 15.5592 0.473777 14.7286L1.05227 12.4688ZM4.5471 14.4577L4.55092 14.4593C4.55284 14.4601 4.55542 14.4611 4.55863 14.4624C4.56141 14.4635 4.56467 14.4648 4.56839 14.4663C4.58445 14.4726 4.60915 14.4824 4.64165 14.495C4.70669 14.5203 4.8027 14.5571 4.92287 14.6015C5.16391 14.6906 5.49862 14.8092 5.87338 14.9273C6.66546 15.1768 7.48714 15.375 8 15.375C11.797 15.375 14.875 12.297 14.875 8.5C14.875 4.70304 11.797 1.625 8 1.625C4.20304 1.625 1.125 4.70304 1.125 8.5C1.125 9.02695 1.33359 9.86848 1.59633 10.6791C1.72064 11.0627 1.84548 11.4051 1.9393 11.6516C1.98607 11.7745 2.02479 11.8727 2.05143 11.9392C2.06474 11.9725 2.075 11.9977 2.08172 12.0141C2.08508 12.0223 2.08755 12.0283 2.08906 12.032L2.09068 12.0359C2.09072 12.036 2.09076 12.0361 2.0908 12.0362C2.18465 12.2615 2.20267 12.5113 2.14213 12.7477L1.56363 15.0076L3.84036 14.4122C4.07459 14.3509 4.32234 14.3668 4.54678 14.4576C4.54679 14.4576 4.5468 14.4576 4.54681 14.4576C4.54685 14.4576 4.54689 14.4577 4.54693 14.4577C4.54693 14.4577 4.54694 14.4577 4.54694 14.4577C4.54699 14.4577 4.54705 14.4577 4.5471 14.4577Z"
			fill="currentColor"
		/>
		<circle cx="8" cy="8.5" r="1.09375" fill="currentColor" />
		<circle cx="4.4375" cy="8.5" r="1.09375" fill="currentColor" />
		<circle cx="11.5625" cy="8.5" r="1.09375" fill="currentColor" />
	</svg>
);
