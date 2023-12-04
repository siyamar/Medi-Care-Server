const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const jwt = require('jsonwebtoken');
require("dotenv").config();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbgngea.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const medicalCampCollection = client.db("mediCampDB").collection("medicalCamps");
    const registeredCollection = client.db("mediCampDB").collection("registered");
    const reviewsCollection = client.db("mediCampDB").collection("reviews");
    const userCollection = client.db("mediCampDB").collection("users");

    //medical camps related api
    app.get("/medicalCamps", async (req, res) => {
      const result = await medicalCampCollection.find().toArray();
      res.send(result);
    });
    app.get("/medicalCamps/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await medicalCampCollection.findOne(query);
      res.send(result);
    });

    app.patch("/medicalCamps/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          campName: item.campName,
          image: item.image,
          campFees: item.campFees,
          scheduledDateTime: item.scheduledDateTime,
          venueLocation: item.venueLocation,
          specializedServices: item.specializedServices,
          healthcareProfessionals: item.healthcareProfessionals,
          targetAudience: item.targetAudience,
          description: item.description,
          participat: item.participat,
        },
      };
      const result = await medicalCampCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.post('/medicalCamps', async(req, res)=>{
      const item = req.body;
      const result = await medicalCampCollection.insertOne(item);
      res.send(result);
    })

    // app.delete('/menu/:id', verifyToken, verifyAdmin, async(req, res)=>{
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)};
    //   const result = await menuCollection.deleteOne(query);
    //   res.send(result);
    // })

    //Registered related api
    app.get("/registered", async (req, res) => {
      const result = await registeredCollection.find().toArray();
      res.send(result);
    });

    app.get("/registered/:id", async (req, res) => {
      const id = req.params.id;
      const query = { campId: id };
      const result = await registeredCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/registered", async (req, res) => {
      const client = req.body;
      const result = await registeredCollection.insertOne(client);
      res.send(result);
    });

    //users related api
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      //ensert email if user doesnt exists
      //you can do this many ways (1. email unique 2. upsert 3. simple checking)
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: item.name,
          image: item.image,
          age: item.age,
          phone: item.phone,
          address: item.address,
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    app.patch('/users/professional/:id', async(req, res)=>{
      const id = req.params.id;
      const filter= {_id: new ObjectId(id)};
      const updatedDoc = {
        $set:{
          role: 'professional'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result)

    })
    app.patch('/users/organizer/:id', async(req, res)=>{
      const id = req.params.id;
      const filter= {_id: new ObjectId(id)};
      const updatedDoc = {
        $set:{
          role: 'organizer'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result)

    })

    //admin check korar jonno
    app.get('/users/admin/:email', async(req, res)=>{
      const email = req.params.email;
      // if(email !== req.decoded.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }
      const query = {email: email};
      const user = await userCollection.findOne(query);
      let admin = false;
      if(user){
        admin = user?.role === 'admin';
      }
      res.send({admin});
    })
    //organizer check 
    app.get('/users/organizer/:email', async(req, res)=>{
      const email = req.params.email;
      // if(email !== req.decoded.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }
      const query = {email: email};
      const user = await userCollection.findOne(query);
      let organizer = false;
      if(user){
        organizer = user?.role === 'organizer';
      }
      res.send({organizer});
    })

    //Healthcare Professionals check 
    app.get('/users/professional/:email', async(req, res)=>{
      const email = req.params.email;
      // if(email !== req.decoded.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }
      const query = {email: email};
      const user = await userCollection.findOne(query);
      let professional = false;
      if(user){
        professional = user?.role === 'professional';
      }
      res.send({professional});
    })

    //reviews related api
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

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
  res.send("Medi Care korbe Care sokoler...");
});

app.listen(port, () => {
  console.log(`Medi Care is Running on port ${port}`);
});
