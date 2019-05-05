const subject = 'Forgot Password'

const body = `Hello,

forgot password token: {token}

click below link to change forgot password:
http://localhost:3000/changeForgotPassword?token={token}
`

module.exports = {
  subject,
  body
}
