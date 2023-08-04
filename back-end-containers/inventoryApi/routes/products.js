import { Statement, InsertItem } from '/opt/nodejs/dynamoDB.mjs'
import { validateObject } from '/opt/nodejs/ObjectValidation/index.mjs'
import { PromiseHandler } from '/opt/nodejs/Utils.mjs'
import express from 'express'
const router = express.Router()

router.get('/', async (req, res) => {
  const data = Statement('SELECT name, id FROM products')
  await PromiseHandler(data,res)
})

router.post('/', async (req, res) => {
  const body = req.body

  const validation_data = validateObject({
    schema: 'products',
    object: body
  })

  if ( validation_data.length > 0 ) {
    res.status(400).json({ errors: validation_data })
    return
  }
  
  await PromiseHandler(InsertItem({
    TableName: 'products',
    data: body
  }),res)
})

router.get('/:id', async (req, res) => {
  const data = Statement(`SELECT * FROM products WHERE id='${req.params.id}'`)
    .then(data => data[0])
  await PromiseHandler(data,res)
})

router.put('/:id', async (req, res) => {
  const body = req.body

  const validation_data = validateObject({
    schema: 'products',
    object: body
  })

  if ( validation_data.length > 0 ) {
    res.status(400).json({ errors: validation_data })
    return
  }

  await PromiseHandler(
    Statement('UPDATE products SET name=? SET unit_quantity=? ' 
      + 'SET nominal_dimensions.thickness=? SET nominal_dimensions.width=? '
      + 'SET nominal_dimensions.length=? SET in_stock=?'
      + 'WHERE id=?',
      [
        body.name,
        body.unit_quantity,
        body.nominal_dimensions.thickness,
        body.nominal_dimensions.width,
        body.nominal_dimensions.length,
        body.in_stock,
        req.params.id
      ]),
    res
  )
})

export { router }