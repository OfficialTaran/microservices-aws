<template>
  <div id="app">
    <NavBar
      @goHome="page='products'"
      @goToCart="page = 'cart'"
      @goToOrders="page = 'orders'"
      @goToInventory="page = 'inventory'"
      ref="navbar"
    />
    <Products v-if="page === 'products'"/>
    <Cart v-else-if="page === 'cart'"/>
    <Orders v-else-if="page === 'orders'"/>
    <Inventory v-else-if="page === 'inventory'"/>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import Products from './components/Products/Products.vue'
import Cart from './components/Cart.vue'
import Orders from './components/Orders/Orders.vue'
import Inventory from './components/Inventory/Main.vue'

import { tokenExchange } from '@utils/api.js'

export default {
  name: 'App',
  metaInfo: {
    title: "Taran's Lumber Yard"
  },
  components: {
    NavBar,
    Products,
    Cart,
    Orders,
    Inventory
  },
  async mounted () {
    await tokenExchange()
    this.$refs['navbar'].loadUserProfile()
  },
  data () {
    return {
      page: 'products'
    }
  }
}
</script>
<style>
.clickable {
  cursor: pointer;
}
.inline-card-text {
  font-size: 20px;
}
.label {
  font-weight: 500;
}
.title {
  font-weight: 700;
}
</style>