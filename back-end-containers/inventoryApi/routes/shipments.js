import { Statement, InsertItem } from '/opt/nodejs/dynamoDB.mjs'
import { validateObject } from '/opt/nodejs/ObjectValidation/index.mjs'
import { PromiseHandler } from '/opt/nodejs/Utils.mjs'
import { BadProductIDError } from '/opt/nodejs/Errors.mjs'
import express from 'express'
const router = express.Router()

router.get('/', async (req, res) => {
  const data = Statement('SELECT date_received, id FROM shipments')
  await PromiseHandler(data,res)
})

router.post('/', async (req,res) => {
  const body = req.body
  const date_now = new Date()
  body.date_received = date_now.toISOString()

  const validation_data = validateObject({
    schema: 'shipments',
    object: body
  })

  if ( validation_data.length > 0 ) {
    res.status(400).json({ errors: validation_data })
    return
  }

  try {
    await updateProducts(body.goods_received)
  }
  catch(error) {
    if (error.name === 'BadProductIDError') {
      res.status(400).json({ msg: error.message })
      return
    } else {
      console.error(error)
      res.status(500).json({ msg: 'Internal Service Error' })
      return
    }
  }

  await PromiseHandler(InsertItem({
    TableName: 'shipments',
    data: body
  }),res)
})

router.get('/:id', async (req, res) => {
  const data = Statement(`SELECT * FROM shipments WHERE id='${req.params.id}'`)
    .then(data => data[0])
  await PromiseHandler(data,res)
})

const updateProducts = async (goods_received) => {
  // get products
  const products = await Statement('SELECT id, unit_quantity FROM products')

  // get list of updates to make
  const received_quantities = []
  goods_received.forEach(item => {
    const product = products.find(p => p.id === item.product_id)

    // error if one of the IDs is not found
    if (product === undefined) {
      throw new BadProductIDError(`product with ID: ${item.product_id} not found`)
    }

    // add to received_quantities
    const index = received_quantities.findIndex(i => i.id === item.product_id)
    if (index === -1) {
      // new item
      received_quantities.push({
        id: item.product_id,
        quantity: product.unit_quantity * item.unit_quantity
      })
    } else {
      // duplicate ID, add both quantities
      received_quantities[index].quantity += product.unit_quantity * item.unit_quantity
    }
  })

  // update quantities in products table
  const promises = received_quantities.map(item => {
    return Statement('UPDATE products SET in_stock = in_stock + ? WHERE id=?',
      [item.quantity,item.id])
  })

  // await promise map of update statements
  return await Promise.all(promises)
}

export { router }