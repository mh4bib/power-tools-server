const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.goxop.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const reviewsCollection = client.db('power_tools').collection('reviews');
        const toolsCollection = client.db('power_tools').collection('tools');
        const ordersCollection = client.db('power_tools').collection('orderedTools');

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const review = await reviewsCollection.insertOne(newReview);
            res.send(review);
        });

        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await toolsCollection.findOne(query);
            res.send(item);
        });

        app.post('/ordered-tools', async (req, res) => {
            const newTool = req.body;
            const tool = await ordersCollection.insertOne(newTool);
            res.send(tool);
        });

        app.get('/my-orders', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const cursor = ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders);
        });

        app.delete('/my-orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await ordersCollection.deleteOne(query);
            res.send(tool);
        });

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from tools')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})