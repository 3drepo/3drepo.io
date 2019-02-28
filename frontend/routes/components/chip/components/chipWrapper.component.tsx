import * as React from 'react';
import { Container } from './chipWrapper.styles';

export class ChipWrapper extends React.PureComponent {
	public render() {
		const { children, ...props } = this.props;
		return (
			<Container {...props}>{children}</Container>
		);
	}
}
