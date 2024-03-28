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
	<svg className={className} width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M14.3775 11.1158L18.9713 6.52206C19.2596 6.23375 19.2596 5.76629 18.9713 5.47798L14.3775 0.884228C14.1664 0.673081 13.8488 0.609917 13.5729 0.724189C13.2971 0.838461 13.1172 1.10766 13.1172 1.40627V5.26172H1.55078C1.14304 5.26172 0.8125 5.59226 0.8125 6C0.8125 6.40774 1.14304 6.73828 1.55078 6.73828H13.1172V10.5938C13.1172 10.8924 13.2971 11.1616 13.5729 11.2759C13.8488 11.3901 14.1664 11.327 14.3775 11.1158ZM14.5938 8.8114V3.18864L17.4051 6.00002L14.5938 8.8114Z" fill="currentColor"/>
	</svg>
);
