import { Statement } from '/opt/nodejs/dynamoDB.mjs'
import { PromiseHandler } from '/opt/nodejs/Utils.mjs'
import { validateObject } from '/opt/nodejs/ObjectValidation/index.mjs'
import { acceptable_states } from '/opt/nodejs/ObjectValidation/Schemas/orders.mjs'
import express from 'express'
const router = express.Router()

router.get('/', async (req, res) => {
  let list_statement = 'SELECT customer, id, staging_location FROM orders'
  if (req.query && req.query.state) {
    // make sure it's a valid state
    if (! acceptable_states.includes(req.query.state)) {
      res.status(400).json({ error: `query parameter state = ${req.query.state} not recognized` })
      return
    }
    // otherwise, add it as a condition
    list_statement = list_statement + ` WHERE state='${req.query.state}'`
  }

  await PromiseHandler(Statement(list_statement),res)
})

router.get('/:id', async (req, res) => {
  const data = Statement(`SELECT * FROM orders WHERE id='${req.params.id}'`)
    .then(data => data[0])
  await PromiseHandler(data,res)
})

router.patch('/:id', async (req, res) => {
  const body = req.body
  const validation_data = validateObject({
    schema: 'ordersPatch',
    object: body
  })

  if ( validation_data.length > 0 ) {
    res.status(400).json({ errors: validation_data })
    return
  }

  await PromiseHandler(
    Statement('UPDATE orders SET state=? SET staging_location=? WHERE id=?',
      [body.state,body.staging_location,req.params.id]),
    res
  )
})

export { router }