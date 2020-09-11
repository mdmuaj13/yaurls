const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const helmet = require('helmet'); 
var path = require('path');
const bodyParser = require('body-parser');
const monk = require('monk'); 

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://mdmuaj:<password>@cluster0.vkpxv.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


require('dotenv').config();

const port = process.env.PORT || 5000;
const db = monk(process.env.MONGO_URI);
const urlshortner = db.get('urls');
urlshortner.createIndex({slug : 1}, { unique: true });

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Set EJS as templating engine 
app.set('view engine', 'ejs'); 
app.set('views',path.join(__dirname, 'public')); 
app.use(express.static(__dirname + '/public'));

const indexRoute = require('./routes/indexRoute');

app.use('/', indexRoute);




app.use((error, req,res,next) =>{
    if(error.status){
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message : error.message,
        stack : process.env.NODE_ENV === 'production' ? 'boom 💣 ' : error.stack
    })
});

app.listen(port, () =>{
    console.log(`Listening at http://localhost:${port}`);
})
