/**
 * Handle a promise and turn response into a Lambda response object
 * 
 * @param {Promise} prom Unresolved Promise
 * @returns {Promise} A Promise that will resolve to a lambda response object
 */
const PromiseHandler = ( prom ) => {
  return prom.then(data => {
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  }).catch(error => {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        msg: 'Internal Service Error'
      })
    }
  })
}

/**
 * Check the Event Authorizer data to see if user is in employees group
 * 
 * @param {object} authorizer From lambda, event.requestContext.authorizer
 * @returns {boolean} Boolean to see if user is in employees group
 */
const verifyEmployee = ( authorizer ) => {
  if (process.env.STAGE === 'dev') {
    return true
  } else {
    if (authorizer.claims['cognito:groups']) {
      if (Array.isArray(authorizer.claims['cognito:groups'])) {
        // handle multiple groups case
        return authorizer.claims['cognito:groups'].includes('employees')
      } else {
        // handle singel groups case
        return authorizer.claims['cognito:groups'] === 'employees'
      }
    } else {
      return false
    }
  }
}

export { PromiseHandler, verifyEmployee }