const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;


const app = express()
const port = process.env.PORT || 5000





//middle wares
app.use(cors())
app.use(express.json())

//mongo db connections
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xplq2xb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//mongodb operations

async function run() {
    try {
        console.log('connected to mongoDB')
        const database = client.db('digitalFashionStore')
        const productsCollection = database.collection('products')

        //products api
        app.get('/products', async (req, res) => {
            console.log(req.query);

            if (!req.query.category == null || !req.query.color==null || !req.query.pattern==null) {
                const catagory = req.query.category
                const color = req.query.color;
                const pattern = req.query.pattern;
                const maxPrice = req.query.maxPrice;
                const minPrice = 0;


                // filtering products
                // const result = await productsCollection.find({
                //     $or: [
                //         {
                //             catagory : catagory,
                //             color : color,
                //             pattern: pattern
                //         },
                //         {
                //            catagory : catagory,
                //             color : color
                //         },
                //         {
                //            catagory : catagory,
                //             pattern: pattern
                //         },
                //         {
                //             color : color,
                //             pattern: pattern
                //         },
                //         {
                //            catagory : catagory
                //         },
                //         {
                //             color : color
                //         },
                //         {
                //             pattern: pattern
                //         }
                //     ]

                // }).toArray()
                // res.json(result)

                // const query = {};

                // if (!req.query.category == ' ' && !req.query.catagory== null) {
                //     query.catagory = req.query.catagory;
                    
                // }

                // if (!req.query.color == ' ' && !req.query.color == null) {
                //     query.color = req.query.color;
                // }

                // if (!req.query.pattern == ' ' && !req.query.pattern == null) {
                //     query.pattern = req.query.pattern;
                // }

                // if (!req.query.price == ' ' && !req.query.price == null) {
                //     const [minPrice, maxPrice] = req.query.price.split('-');
                //     if (minPrice) {
                //         query.price = { $gte: parseInt(minPrice) };
                //     }
                //     if (maxPrice) {
                //         query.price = { ...query.price, $lte: parseInt(maxPrice) };
                //     }
                // }
                console.log(query);
                const result = await productsCollection.find({price:{$lt:200}}).toArray()
                res.json(result)
                console.log('result',result);
                

            }
            // else {
            //     const result = await productsCollection.find({}).toArray()
            //     res.json(result)
            // }


        })
        //get a single product by id 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query)
            res.json(result)
        })

        //upload product api
        app.post('/upload/product', async (req, res) => {
            console.log(req.body);
            const result = await productsCollection.insertOne(req.body)
            res.json(result)
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(err => console.log(err))


//stripe checkout 

const DOMAIN = 'https://digital-fashion-store.web.app/';

app.post('/create-checkout-session', async (req, res) => {
    console.log('post hitted', req.body);
    const line_items = req.body.cart.map(item => {
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    images: [item.thumbnail],

                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }
    })

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: `${DOMAIN}/checkout-success`,
        cancel_url: `${DOMAIN}/cart`,
    });

    res.send({ url: session.url });
});



//root api
app.get('/', (req, res) => {
    res.send('Responding from Digital Fashion Store Server')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})