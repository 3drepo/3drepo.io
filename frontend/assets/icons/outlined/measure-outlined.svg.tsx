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
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M2.14173 5.70489L14.2951 17.8583L17.8583 14.2951L15.5657 12.0026L14.3538 13.2144C14.0792 13.489 13.634 13.489 13.3594 13.2144C13.0849 12.9399 13.0849 12.4947 13.3594 12.2201L14.5713 11.0082L12.2788 8.71562L11.0669 9.92751C10.7923 10.2021 10.3471 10.2021 10.0725 9.92751C9.79792 9.65292 9.79792 9.20773 10.0725 8.93314L11.2844 7.72125L8.99182 5.42868L7.77994 6.64057C7.50535 6.91515 7.06015 6.91515 6.78557 6.64057C6.51098 6.36598 6.51098 5.92078 6.78557 5.6462L7.99745 4.43431L5.70488 2.14174L2.14173 5.70489ZM0.658458 6.21036C0.379295 5.9312 0.379294 5.47859 0.658458 5.19942L5.19941 0.65847C5.47858 0.379298 5.9312 0.379313 6.21035 0.65847L19.3415 13.7897C19.6207 14.0688 19.6207 14.5214 19.3415 14.8006L14.8006 19.3416C14.5215 19.6207 14.0689 19.6208 13.7897 19.3416L0.658458 6.21036Z" fill="currentColor"/>
	</svg>
);
