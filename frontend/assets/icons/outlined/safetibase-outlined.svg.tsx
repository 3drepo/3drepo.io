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
		<path d="M9.35626 12.0898C9.54534 11.9578 9.76926 11.8844 9.99999 11.8786C10.156 11.8767 10.3108 11.9055 10.4557 11.9632C10.6006 12.021 10.7326 12.1067 10.8443 12.2154C10.9559 12.324 11.045 12.4536 11.1065 12.5966C11.168 12.7396 11.2006 12.8933 11.2025 13.0489C11.2024 13.2791 11.1343 13.5041 11.0066 13.6959C10.8789 13.8877 10.6973 14.0376 10.4846 14.127C10.2719 14.2163 10.0375 14.2412 9.81075 14.1983C9.58398 14.1555 9.37492 14.0469 9.20972 13.8861C9.04453 13.7253 8.93054 13.5195 8.88203 13.2945C8.83352 13.0694 8.85264 12.8351 8.93699 12.6208C9.02134 12.4066 9.16718 12.2219 9.35626 12.0898Z" fill="currentColor"/>
		<path d="M9.31734 2.95178C9.52932 2.84638 9.76313 2.79199 9.99999 2.79299C10.2367 2.79285 10.4702 2.8476 10.6821 2.95294C10.8939 3.05827 11.0783 3.21129 11.2207 3.39991C11.8074 4.1304 11.9713 5.38785 11.6652 6.76887C11.279 8.50969 10.6741 10.5849 9.99999 10.5849C9.32588 10.5849 8.721 8.50969 8.33475 6.76524C8.02866 5.38422 8.19264 4.12676 8.7793 3.39991C8.92108 3.21066 9.10535 3.05718 9.31734 2.95178Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M1.41241 0.625L18.5876 0.625001C19.6591 0.625002 20.3393 1.77273 19.8248 2.71263L11.2541 18.3696C10.7195 19.3463 9.31713 19.3475 8.78089 18.3717L0.176364 2.71469C-0.3402 1.77473 0.339862 0.625 1.41241 0.625ZM1.41241 2.0354L18.5876 2.0354L10.0169 17.6924L1.41241 2.0354Z" fill="currentColor"/>
	</svg>
);
