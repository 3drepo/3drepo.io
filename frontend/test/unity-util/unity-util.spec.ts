import { UnityUtil } from '../../src/globals/unity-util';

describe('UnityUtil', () => {
	it('should call exampleMethod and return expected result', () => {
		// Arrange
		const input = 'test';
		const expected = ''; // The document is mocked but won't have cookies

		// Act
		const result = UnityUtil.getCookies();

		// Assert
		expect(result).toEqual(expected);
	});
});
