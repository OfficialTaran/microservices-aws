import { Statement } from '/opt/nodejs/dynamoDB.mjs'
import { PromiseHandler } from '/opt/nodejs/Utils.mjs'
import express from 'express'
const router = express.Router()

router.get('/', async (req, res) => {
  const data = Statement('SELECT name, id, in_stock FROM products WHERE in_stock > 0')
  await PromiseHandler(data,res)

})

router.get('/:id', async (req, res) => {
  const data = Statement(`SELECT name, id, in_stock, nominal_dimensions FROM products WHERE id='${req.params.id}'`)
    .then(data => data[0])
  await PromiseHandler(data,res)
})

export { router }