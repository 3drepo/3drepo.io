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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M1.40627 -0.00325012C0.629608 -0.00325012 0 0.626404 0 1.40312V7.48004C0 8.25676 0.629607 8.88641 1.40627 8.88641H7.48274C8.2594 8.88641 8.88901 8.25676 8.88901 7.48004V1.40312C8.88901 0.626404 8.2594 -0.00325012 7.48274 -0.00325012H1.40627ZM7.48274 1.40312H1.40627L1.40627 7.48004L7.48274 7.48004L7.48274 1.40312Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M12.5171 -0.00325012C11.7404 -0.00325012 11.1108 0.626404 11.1108 1.40312V7.48004C11.1108 8.25676 11.7404 8.88641 12.5171 8.88641H18.5936C19.3702 8.88641 19.9998 8.25676 19.9998 7.48004V1.40312C19.9998 0.626404 19.3702 -0.00325012 18.5936 -0.00325012H12.5171ZM18.5936 1.40312H12.5171L12.5171 7.48004L18.5936 7.48004V1.40312Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M0 12.5164C0 11.7397 0.629608 11.11 1.40627 11.11H7.48274C8.2594 11.11 8.88901 11.7397 8.88901 12.5164V18.5933C8.88901 19.37 8.2594 19.9997 7.48274 19.9997H1.40627C0.629607 19.9997 0 19.37 0 18.5933V12.5164ZM1.40627 12.5164H7.48274L7.48274 18.5933H1.40627L1.40627 12.5164Z" fill="currentColor"/>
		<path d="M15.5556 11.5202C15.9439 11.5202 16.2587 11.835 16.2587 12.2234V14.8535H18.8893C19.2777 14.8535 19.5925 15.1683 19.5925 15.5567C19.5925 15.9451 19.2777 16.2599 18.8893 16.2599H16.2587V18.8906C16.2587 19.279 15.9439 19.5938 15.5556 19.5938C15.1672 19.5938 14.8524 19.279 14.8524 18.8906V16.2599H12.2226C11.8343 16.2599 11.5194 15.9451 11.5194 15.5567C11.5194 15.1683 11.8343 14.8535 12.2226 14.8535H14.8524V12.2234C14.8524 11.835 15.1672 11.5202 15.5556 11.5202Z" fill="currentColor"/>
	</svg>
);
