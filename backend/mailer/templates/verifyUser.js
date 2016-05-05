var html = data => `
	Hi there,<br>
	<br>
	Let's confirm your email address.<br>
	By clicking on the following link, you are confirming your email address ${data.email} 
	and agreeing to 3DRepo's Terms of Service.<br> 
	<br>
	<a href="${data.url}">Confirm Email Address</a>
`;

module.exports =  {
	html: html,
	subject: 'Welcome To 3DRepo! Verify Your Email‏'
};
