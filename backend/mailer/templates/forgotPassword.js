var html = data => `
	Hi there,<br>
	<br>
	You've requested to reset your password, please click on the following link to reset your password.<br>
	<br>
	<a href="${data.url}">Reset My Password</a>
`;

module.exports =  {
	html: html,
	subject: 'Reset your password'
};
