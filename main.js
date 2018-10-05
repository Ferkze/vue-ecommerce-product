var eventBus = new Vue( )

Vue.component('product', {
    props:{
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">

            <div class="product-image">
                <img :src="image">
            </div>

            <div class="product-info">

                <h1>{{ title }}</h1>
                <p v-if="inStock > 3">In Stock</p>
                <p v-else-if="inStock < 4 && inStock > 0">Almost sold out</p>
                <p v-else>Out of Stock</p>
                <p> Shipping: {{ shipping }} </p>

                <ul>
                    <li v-for="detail in product.details">{{ detail }}</li>
                </ul>

                <h2>Colors:</h2>
                <div v-for="(variant, index) in product.variants" :key="variant.variantId"
                class="color-box" :style="{backgroundColor: variant.variantColor}"
                @mouseover="updateProduct(index)">
                </div>

                <button @click="addToCart" :disabled="!inStock"
                        :class="{ disabledButton: !inStock}">Add to Cart</button>
                <button @click="removeFromCart"> - </button>
            </div>
            
            <product-tabs :reviews="product.reviews"></product-tabs>

        </div>
    `,
    data() {
        return {
            product: {
                name: 'Socks',
                brand: 'Vue Mastery',
                selectedVariant: 0,
                details: ["80% cotton", "20% polyester", "Gender-neutral"],
                reviews: [],
                variants: [
                    {
                        variantId: 1,
                        variantColor: "green",
                        variantImage: './assets/vmSocks-green.jpg',
                        variantQuantity: 6
                    },
                    {
                        variantId: 2,
                        variantColor: "blue",
                        variantImage: './assets/vmSocks-blue.jpg',
                        variantQuantity: 2
                    }
                ]
                
            }
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.product.variants[this.product.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.product.selectedVariant = index
        },
        removeFromCart() {
            this.$emit('remove-product', this.product.variants[this.product.selectedVariant].variantId)
        }
    },
    computed: {
        title() {
            return `${this.product.brand} ${this.product.name}`
        },
        image() {
            return this.product.variants[this.product.selectedVariant].variantImage
        },
        inStock(){
            return this.product.variants[this.product.selectedVariant].variantQuantity
        },
        shipping(){
            if (this.premium) return "Free"
            return 2.99
        }
    },
    mounted() {
        eventBus.$on('review-submit', productReview => {
            this.product.reviews.push(productReview)
        })
    }   
})
Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{error}}</li>
            </ul>
        </p>

        <p>
            <label for="name"> Name: </label>
            <input id="name" v-model="name">
        </p>

        <p>
            <label for="review"> Review: </label>
            <textarea id="review" v-model="review"></textarea
        </p>

        <p>
            <label for="rating"> Rating: </label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>

        <p>
            <input type="submit" value="Submit">
        </p>
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                eventBus.$emit('review-submit', productReview)
                this.name = null
                this.review = null
                this.rating = null
            }
            else {
                if (!this.name) this.errors.push("Name required")
                if (!this.review) this.errors.push("Review required")
                if (!this.rating) this.errors.push("Rating required")
            } 
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>
        <span class="tab"
              :class="{ activeTab: selectedTab === tab}"
              v-for="(tab, index) in tabs"
              :key="index"
              @click="selectedTab = tab">
              {{ tab }}</span>

              <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul v-else>
                    <li v-for="review in reviews">
                        <p>{{review.name}} - {{review.rating}} Stars</p>
                        <p>{{review.review}}</p>
                    </li>
                </ul>
            </div>

            <product-review v-show="selectedTab === 'Make a Review'">
            </product-review>

    </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

var app = new Vue({
    el:'#app',
    data: {
        premium: false,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeProduct(id) {
            this.cart.splice(this.cart.indexOf(id), 1)
        }
    }
})