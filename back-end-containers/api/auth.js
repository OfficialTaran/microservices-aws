import CognitoExpress from 'cognito-express'

const cognitoExpress = new CognitoExpress({
	region: process.env.AWS_REGION,
	cognitoUserPoolId: process.env.COGNITO_POOL_ID,
	tokenUse: "id",
	tokenExpiration: 3600000
});

const authFunction = async (req, res, next) => {
  if (process.env.STAGE === 'dev') {
    req.user_id = '1'
  } else {
    if (req.headers.authorization) {
      await cognitoExpress.validate(req.headers.authorization).then(response => {
          req.user = response
          req.user_id = response['cognito:username']
          next()
        }).catch(err => {
          res.sendStatus(401)
          return
        })
    } else {
      res.status(401).send("Access Token missing from header")
      return
    } 
  }
}

export { authFunction }