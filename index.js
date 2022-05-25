const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.goxop.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//     const authHeaders = req.headers.authorization;
//     if (!authHeaders) {
//         return res.status(401).send({ message: 'unauthorized access' });
//     }
//     const token = authHeaders.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden access' });
//         }
//         req.decoded = decoded;
//         next();
//     });
// }

async function run() {
    try {
        await client.connect();
        const reviewsCollection = client.db('power_tools').collection('reviews');
        const toolsCollection = client.db('power_tools').collection('tools');
        const ordersCollection = client.db('power_tools').collection('orderedTools');
        const usersCollection = client.db('power_tools').collection('users');

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

        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email:email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });

        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })
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