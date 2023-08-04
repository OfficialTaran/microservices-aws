import { router as orderRoutes } from './routes/orders.js'
import { router as productRoutes } from './routes/products.js'
import express from 'express'

// constants
const port = process.env.PORT || 80

// setup express
const app = express()
app.use(express.json())

// routes
app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)

app.get('/api/hello', (req,res) => {
  console.log('update')
  res.json({msg: 'hello'})
})

app.listen(port, function () {
  console.log("Server has started on port: ", port);
});