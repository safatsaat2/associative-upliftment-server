const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();
const port = process.env.PORT || 7000;

// middleware

app.use(cors());
app.use(express.json());

app.get('/config', (req, res) =>{
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

app.post("/create-payment-intent", async(req, res) =>{
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "eur",
      amount: 1000,
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.send({clientSecret: paymentIntent.client_secret})
  } catch (error) {
    res.status(400).send({
      error:{
      massage: error.massage,
      }
    })
  }
})

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.vlmivx3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // DataBases
    const userCollection = client
      .db("associativeUpliftment")
      .collection("usersCollection");
    const orderCollection = client
      .db("associativeUpliftment")
      .collection("ordersCollection");
      const ticketCollection = client
      .db("associativeUpliftment")
      .collection("ticketCollection")

    // User Adding to Database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const existedUser = await userCollection.findOne(query);
      if (existedUser) {
        return res.send({ massage: "User Already Exist" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // Getting user from Database

    app.get('/users', async(req,res)=>{
      const result = await userCollection.find().toArray();
      res.send(result)
    })
    app.get('/users/:email', async(req,res)=>{
      const {email} = req.params;
      const query = {email: email}
      const result = await userCollection.findOne(query);
      console.log(result)
      res.send(result)
    })


    // Order Database
    app.post("/orders", async (req, res) => {
      const order = req.body;
  
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.get("/orders/:email", async (req, res) => {
      const { email } = req.params;
      const query = { email };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });
    app.patch("/orders/accept/:id", async(req, res) =>{
      const id = req.params.id;
      const item = { _id: new ObjectId(id) }
      const updateDoc = {
        $set:{
          status: "Approved"
        },
      };
      const result = await orderCollection.updateOne(item, updateDoc)
      res.send(result)
    })
    app.patch("/orders/delete/:id", async(req, res) =>{
      const id = req.params.id;
      const item = { _id: new ObjectId(id) }
      const updateDoc = {
        $set:{
          status: "Declined"
        },
      };
      const result = await orderCollection.updateOne(item, updateDoc)
      res.send(result)
    })
    // Ticket Collection
    app.post("/tickets", async(req, res) =>{
      const info = req.body

      const result = await ticketCollection.insertOne(info);
      res.send(result);
      
    })
    app.get("/tickets", async (req, res) => {
      const result = await ticketCollection.find().toArray();
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("app is running");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
