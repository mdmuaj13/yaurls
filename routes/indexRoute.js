const express = require('express')
const yup = require('yup');
const monk = require('monk'); 
const { nanoid } = require('nanoid');
const bodyParser = require('body-parser');
const indexRouter = express.Router();


indexRouter.use(bodyParser.urlencoded({ extended: true })); 

 

const db = monk(process.env.MONGO_URI);
const urlshortner = db.get('url');
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

indexRouter.route('/create-url')
.post(async (req,res,next) =>{
    let { slug, url } = req.body; 
    console.log(req.body);
    try {
        await schema.validate({
            slug, url
        });
        if(!slug){
            slug = nanoid(4);
        }else {
            if(slug == 'create-url'){
                throw new Error('So cruel!! Nice try 🤸‍♂️  ');
            }
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

indexRouter.route('/all-urls')
.get( (req,res,next) => {

});


module.exports = indexRouter;