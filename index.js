
const express = require('express');
const  cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gqui7fc.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

const jobCetagoryCollection = client.db('jobCetagoryDB').collection('jobCetagory');
const applyCollection = client.db('applyDB').collection('apply');
    // Send a ping to confirm a successful connection

    //Job cetagory read
    app.get('/jobCetagory',async(req,res)=>{
      const jobs = jobCetagoryCollection.find()
      const result = await jobs.toArray();
      // result.map(async (rs)=>{
      //   const applyCount = await applyCollection.find({
      //     $where:{
            
      //     }
      //   })
      // });
      res.send(result)
    })

    //add job category from
    app.post("/jobCetagory",async(req,res)=>{
      const addJob = req.body;
      console.log(addJob);
      const result = await jobCetagoryCollection.insertOne(addJob)
      console.log(result);
      res.send(result)

    })
    //add apply from
    app.post("/apply",async(req,res)=>{
      const applyCard = req.body;
      console.log(applyCard);
      const result = await applyCollection.insertOne(applyCard)
      console.log(result);
      res.send(result)

    })

    //read apply from
    app.get('/apply',async(req,res)=>{
      const apply = applyCollection.find()
      const result = await apply.toArray();
      res.send(result)
    })

    //myJob  post delete
    app.delete("/jobCetagory/:id", async (req, res) =>{
      const id = req.params.id;
       const query = {
        _id: new ObjectId(id),
       }
       const result = await jobCetagoryCollection.deleteOne(query);
       res.send(result);
    })

    // update My post  
    app.put("/jobCetagory/:id",async(req,res)=>{
      const id = req.params.id;
      const data = req.body;
      const options = {upset: true};
      const filter = {
        _id: new ObjectId(id),
       }
      const updateJob = {
        $set:{
          name:data.name,
          jobTitle:data.jobTitle,
          category:data.category,
          deadline:data.deadline,
          postingDate:data.postingDate,
          salaryRange:data.salaryRange,
          description:data.description,
          img:data.img,
        }
      }
      const result = await jobCetagoryCollection.updateOne(filter,updateJob,options);
      res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
     res.send(' Jobs Seeking server in running ')
});

app.listen(port,()=>{
     console.log(`server is running on port ${port}`)
})
