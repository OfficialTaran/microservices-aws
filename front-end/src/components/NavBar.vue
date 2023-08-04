<template>
<div>
  <b-navbar type="dark" variant="dark">
    <b-navbar-brand 
      href="#"
      @click="$emit('goHome')"
    > 
      Taran's Lumber Yard
    </b-navbar-brand>
    <b-navbar-nav class="ml-auto">
      <b-nav-item 
        v-if="in_employees_group"
        @click="$emit('goToInventory')"
      >
        Inventory Page
      </b-nav-item>
      <b-nav-item 
        v-if="signed_in" 
        @click="$emit('goToOrders')"
      >
        Orders
      </b-nav-item>
      <b-nav-item @click="toggleAuth()">{{ auth_text }}</b-nav-item>
      <b-nav-item 
        v-if="signed_in" 
        @click="$emit('goToCart')"
      >
        <b-icon-cart-3/>
      </b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</div>
</template>
  
<script>
import { BIconCart3 } from 'bootstrap-vue'
import { UserManager, signOut } from '@utils/api.js'
import { isEqual } from 'lodash'

export default {
  name: 'NavBar',
  components: {
    BIconCart3
  },
  data () {
    return {
      user_profile: {}
    }
  },
  computed: {
    signed_in () {
      return (! isEqual(this.user_profile,{})) 
        || (process.env.VUE_APP_STAGE === 'dev')
    },
    auth_text () {
      return this.signed_in ? 'Log Out' : 'Log In'
    },
    in_employees_group () {
      return (this.user_profile['cognito:groups'] 
        && this.user_profile['cognito:groups'].includes('employees')) 
        || (process.env.VUE_APP_STAGE === 'dev')
    }
  },
  async mounted () {
    this.loadUserProfile()
  },
  methods: {
    async login () {
      if (process.env.VUE_APP_STAGE !== 'dev') {
        await UserManager.signinRedirect().catch(err => console.error(err))
      }
    },
    async logout () {
      if (process.env.VUE_APP_STAGE !== 'dev') {
        signOut()
      }
    },
    async toggleAuth () {
      this.signed_in ? this.logout() : this.login()
    },
    async loadUserProfile () {
      const user = await UserManager.getUser()
      this.user_profile = user ? user.profile : {}
    }
  }
}
</script>