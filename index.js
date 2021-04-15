const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("bson");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zuq5f.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

 
client.connect((err) => {
  const serviceCollection = client
    .db(process.env.DB_NAME)
    .collection("service");
  const order = client.db(process.env.DB_NAME).collection("order");
  const reviews = client.db(process.env.DB_NAME).collection("reviews");
  const adminCollection = client.db(process.env.DB_NAME).collection("admin");
  
  app.post("/reviews", (req, res) => {
    const data = req.body;
    reviews.insertOne(data).then((result) => {
      res.send(result);
    });
  });
  
  app.post("/addServices", (req, res) => {
    const service = req.body;
    serviceCollection.insertOne(service).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });


  app.delete("/services/:id",(req,res)=>{
    serviceCollection.deleteOne({_id:ObjectId(req.params.id)}).then(result=>{
      res.send(result)
    })
  })

  app.post("/myServices", (req, res) => {
    const email = req.body.email;
    serviceCollection.find({ email: email }).toArray((err, services) => {
      res.send(services);
    });
  });

  app.post("/order",(req,res)=>{
    const data = req.body;
    order.insertOne(data).then((result) => {
      res.send(result.insertedCount > 0);
    });
  })
 app.get("/order",(req,res)=>{
   const {email} = req.query
     email?order.find({email:email}).toArray((err,data)=>{
      res.send(data)
    }):
    order.find().toArray((err,data)=>{
      res.send(data)
    })
  })

  app.post("/order/status",(req,res)=>{
    const {status, id} = req.body;
    order.updateOne({_id:ObjectId(id)},{ $set: { "status" : status }})
    .then((err,data)=>{
      res.send(data)
    })
  
  })
  


  app.post("/addadmin", (req, res) => {
    const data = req.body;
    adminCollection.insertOne(data).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });
});

app.listen(process.env.PORT || port ,(err)=>{
    console.log(`Server is running on port ${port}`)
});
