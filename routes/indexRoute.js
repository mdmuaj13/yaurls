const express = require('express')
const yup = require('yup');
const monk = require('monk'); 
const { nanoid } = require('nanoid');
const indexRouter = express.Router();


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://mdmuaj:<Mhmuaj#13>@cluster0.vkpxv.mongodb.net/<urlshortner>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("urlshortner").collection("urls");
//   // perform actions on the collection object
//   client.close();
// });

const db = monk(process.env.MONGO_URI);
const urlshortner = db.get('urls');
urlshortner.createIndex({slug : 1}, { unique: true });


const schema = yup.object().shape({
    slug : yup.string().trim().matches(/[\w\-]/i, { excludeEmptyString: true }),
    url : yup.string().trim().url().required()
});
 

indexRouter.route('/')
.get((req,res,next) =>{
    res.render('index');
});

indexRouter.route('/:id')
.get(async (req,res,next) =>{
    const { id : slug } = req.params;


    try {
        const url = await urlshortner.findOne({ slug });
        if(url){
            res.redirect(url.url);
        }
        res.redirect(`/?error=${slug} not found!! 🙈`);
    } catch (error) { 
        res.redirect(`/?error=Link not found!! 🙊 `);
    }
});

indexRouter.route('/url')
.post(async (req,res,next) =>{
    let { slug, url } = req.body; 
    try {
        await schema.validate({
            slug, url
        });
        if(!slug){
            slug = nanoid(4);
        }else {
            const existing = await urlshortner.findOne({ slug });
            if(existing) {
                throw new Error('Slug is in use  🦕 ');
            }
        }
        slug = slug.toLowerCase();
        const newUrl = { url, slug };
        const created = await urlshortner.insert(newUrl);
        res.json(newUrl);

    } catch (error) {
        next(error);
    }
});


module.exports = indexRouter;