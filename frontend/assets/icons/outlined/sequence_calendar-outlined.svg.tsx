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
		<path fillRule="evenodd" clipRule="evenodd" d="M7.08984 16.1862V11.3514C7.08984 10.1609 8.47686 9.50897 9.39347 10.2687L12.402 12.7622C13.0941 13.3359 13.0777 14.4027 12.3683 14.9547L9.35975 17.296C8.4361 18.0148 7.08984 17.3566 7.08984 16.1862ZM8.49609 16.1862V11.3514L11.5046 13.845L8.49609 16.1862Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M5.89944 0.0976562C6.28777 0.0976562 6.60257 0.412456 6.60257 0.800781V1.78402H13.3974V0.800781C13.3974 0.412456 13.7122 0.0976562 14.1006 0.0976562C14.4889 0.0976562 14.8037 0.412456 14.8037 0.800781V1.78402H17.1875C18.7408 1.78402 20 3.04322 20 4.59652V17.1838C20 18.7371 18.7408 19.9963 17.1875 19.9963H2.8125C1.2592 19.9963 0 18.7371 0 17.1838V4.59652C0 3.04322 1.2592 1.78402 2.8125 1.78402H5.19632V0.800781C5.19632 0.412456 5.51112 0.0976562 5.89944 0.0976562ZM13.3974 3.19027V4.15274C13.3974 4.54106 13.7122 4.85586 14.1006 4.85586C14.4889 4.85586 14.8037 4.54106 14.8037 4.15274V3.19027H17.1875C17.9642 3.19027 18.5938 3.81987 18.5938 4.59652V7.2038H1.40625V4.59652C1.40625 3.81987 2.03585 3.19027 2.8125 3.19027H5.19632V4.15274C5.19632 4.54106 5.51112 4.85586 5.89944 4.85586C6.28777 4.85586 6.60257 4.54106 6.60257 4.15274V3.19027H13.3974ZM1.40625 8.61005H18.5938V17.1838C18.5938 17.9605 17.9641 18.5901 17.1875 18.5901H2.8125C2.03585 18.5901 1.40625 17.9605 1.40625 17.1838V8.61005Z" fill="currentColor"/>
	</svg>
);
