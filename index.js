const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(express.json());
app.use(cors());

/* mongoDB functionality start */
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@ic-cluster.qdhi4wp.mongodb.net/?appName=ic-cluster`;

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

    // create all collection
    const db = client.db("auto-car");
    const carSellingCollection = db.collection("car-selling");
    const carCommentCollection = db.collection("car-comment");

    /* car selling api start */
    app.get("/car-selling-home", async (req, res) => {
      const cursor = carSellingCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(1);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/car-selling", async (req, res) => {
      const cursor = carSellingCollection.find().sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/car-selling/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      try {
        const result = await carSellingCollection.findOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Invalid ID or server error" });
      }
    });

    app.post("/car-selling", async (req, res) => {
      const car_selling = req.body;
      car_selling.createdAt = new Date();

      const result = await carSellingCollection.insertOne(car_selling);
      res.send(result);
    });
    /* car selling api end */

    /* car comment api start */
    app.get("/car-comments/:carId", async (req, res) => {
      const { carId } = req.params;
      try {
        const comments = await carCommentCollection
          .find({ carId })
          .sort({ createdAt: -1 })
          .toArray();
        res.send(comments);
      } catch (err) {
        res.status(500).send({ error: "Server error" });
      }
    });

    app.post("/car-comments", async (req, res) => {
      const { carId, email, comment } = req.body;
      if (!carId || !email || !comment) {
        return res.status(400).send({ error: "All fields required" });
      }

      try {
        const result = await carCommentCollection.insertOne({
          carId,
          email,
          comment,
          createdAt: new Date(),
        });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Server error" });
      }
    });
    /* car comment api end */

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
/* mongoDB functionality end */

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`server is running on  http://localhost:${port}`);
});
