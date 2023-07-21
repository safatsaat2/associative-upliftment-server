const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 7000;

// middleware

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process
.env.USER_NAME}:${process.env.USER_PASS}@cluster0.vlmivx3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
// DataBases
    const userCollection = client.db('associativeUpliftment').collection('usersCollection')
    const orderCollection = client.db('associativeUpliftment').collection('ordersCollection')


    // User Adding to Database
    app.post('/users', async(req,res)=>{
      const user = req.body;
      const query = {email: user?.email}
      const existedUser = await userCollection.findOne(query);
      if(existedUser){
        return res.send({massage: 'User Already Exist'})
      }


      const result = await userCollection.insertOne(user)
      res.send(result)
    })
          // Order Database
    app.post('/orders', async(req, res) =>{
      const order = req.body;
      console.log(order)
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })

    app.get('/orders/:email', async(req, res) =>{
      const {email}  = req.params;
      const  query = {email}
      const result = await orderCollection.find(query).toArray()
      res.send(result) 
    })






    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send("app is running")
})

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})