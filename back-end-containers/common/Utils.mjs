/**
 * Handle a promise and turn response into a Lambda response object
 * 
 * @param {Promise} prom Unresolved Promise
 * @param {object} res Express response object
 * @returns {Promise} A Promise that will resolve or reject with a proper response
 */
const PromiseHandler = (prom, res) => {
  return prom.then(data => {
    res.json(data)
  }).catch(error => {
    console.error(error)
    res.status(500)
  })
}


export { PromiseHandler }