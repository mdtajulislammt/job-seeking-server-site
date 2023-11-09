const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://searching-jobs.web.app",
      "https://searching-jobs.firebaseapp.com"
  ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gqui7fc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//middlewares
const logger = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

//verify token
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobCetagoryCollection = client
      .db("jobCetagoryDB")
      .collection("jobCetagory");
    const applyCollection = client.db("applyDB").collection("apply");
    // Send a ping to confirm a successful connection

    // auth related api
    app.post("/jwt", logger, async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/logOut", async (req, res) => {
      const user = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    //Job cetagory read
    app.get("/jobCetagory", logger, async (req, res) => {
      const jobs = jobCetagoryCollection.find();
      const result = await jobs.toArray();
      res.send(result);
    });

    //add job category from
    app.post("/jobCetagory", logger, async (req, res) => {
      const addJob = req.body;
      
      const result = await jobCetagoryCollection.insertOne(addJob);
      res.send(result);
    });
    //add apply from
   
      app.post("/apply", logger,  async (req, res) => {
      const applyCard = req.body;
    const result = await applyCollection.insertOne(applyCard);
    jobCetagoryCollection.updateOne(
      { _id: new ObjectId(applyCard.postId) },
      { $inc: { applicantsNumber: 1 } }
    )
    console.log('LOg result',applyCard.postId);
      res.send(result);
    }); 
  

    //read apply from
    app.get("/apply", logger, async (req, res) => {
      
      const apply = applyCollection.find();
      const result = await apply.toArray();
     
      res.send(result);
    });

    //myJob  post delete
    app.delete("/jobCetagory/:id", logger, async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await jobCetagoryCollection.deleteOne(query);
      res.send(result);
    });

    // update My post
    app.put("/jobCetagory/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const options = { upset: true };
      const filter = {
        _id: new ObjectId(id),
      };
      const updateJob = {
        $set: {
          name: data.name,
          jobTitle: data.jobTitle,
          category: data.category,
          deadline: data.deadline,
          postingDate: data.postingDate,
          salaryRange: data.salaryRange,
          description: data.description,
          img: data.img,
        },
      };
      const result = await jobCetagoryCollection.updateOne(
        filter,
        updateJob,
        options
      );
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" Jobs Seeking server in running ");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
