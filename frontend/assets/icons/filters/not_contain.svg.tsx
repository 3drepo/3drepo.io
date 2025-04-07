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
	<svg className={className} width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M6.59821 1.01218C6.7651 0.758372 6.69463 0.417335 6.44083 0.250449C6.18702 0.0835631 5.84599 0.154025 5.6791 0.407831L5.11877 1.26H4.04866C1.98312 1.26 0.308661 2.93445 0.308661 5C0.308661 5.88245 0.614288 6.69353 1.12547 7.33315L0.3991 8.43783C0.232214 8.69164 0.302676 9.03267 0.556482 9.19956C0.810287 9.36645 1.15133 9.29598 1.31821 9.04218L1.94328 8.09155C2.54298 8.50074 3.26788 8.74 4.04866 8.74H6.24866C6.55242 8.74 6.79866 8.49375 6.79866 8.19C6.79866 7.88624 6.55242 7.64 6.24866 7.64H4.04866C3.49113 7.64 2.97396 7.46717 2.54781 7.17216L5.71197 2.36H6.24866C6.55242 2.36 6.79866 2.11375 6.79866 1.81C6.79866 1.56526 6.63882 1.35786 6.41783 1.2865L6.59821 1.01218ZM4.39548 2.36H4.04866C2.59063 2.36 1.40866 3.54196 1.40866 5C1.40866 5.49079 1.54259 5.95029 1.77588 6.34397L4.39548 2.36Z" fill="currentColor"/>
	</svg>
);