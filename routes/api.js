/*
*
*
*       Complete the API routing below
*       
*       
*/



'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {type:String, required: true},
  comments: {type:Array},
  commentcount:{type:Number,default:0}
});

const Item = mongoose.model('ItemModel',itemSchema);

module.exports = async function (app) {

  app.route('/api/books')
    .post(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let reqBody = req.body;
      const {title} = reqBody;
      try{
        if (!title){
          return res.send('missing required field title');
        }
        const item = new Item({
        title,
        comments: [],
        commentcount: 0
        });
        await item.save();
        return res.json({_id:item._id, title: item.title})
      } catch(err){
        console.log(err);
        return res.status(500).json({error:'Server error'});
      }
    })
    
    .get(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      try{
        const items = await Item.find();
        if (!items) return res.send('no book exists');
        return res.json(items);
      }catch(err){
        return res.status(500).json({error:'Server error'});
      }
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      try{
        const items = await Item.deleteMany();
        if(!items) return res.send('no book exists');
        return res.send('complete delete successful');
      }catch(err){
        console.error(err);
        return res.status(500).json({error:'Server error'});
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try{
        if (!bookid) return res.send('no book exists');
        
        const item = await Item.findOne({_id:bookid});
        if (!item) return res.send('no book exists');
        if (!item.comments) item.comments = [];
        return res.json(item);
      }catch(err){
        console.log(err);
        return res.status(500).json({error:'Server error'});
      }
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      try{
        if (!bookid) return res.send('no book exists');
        
        if (!comment) return res.send('missing required field comment');

        const item = await Item.findOne({_id : bookid});
        if(!item) return res.send('no book exists');

        item.comments.push(comment);
        item.commentcount++;
        await item.save();
        return res.send(item);
      }catch(err){
        console.error(err);
        return res.status(500).json({error:'Server error'});
      }
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try{
        if(!bookid) return res.send('no book exists');
        

        const item = await Item.deleteOne({_id:bookid});
        if(!item.deletedCount) return res.send('no book exists');
        return res.send('delete successful');
      }catch(err){
        console.log(err);
        return res.status(500).json({error:'Server error'});
      }
    });

    try{
      await mongoose.connect(process.env.DB);
      console.log('connection successful');
    } catch(err){
      console.log('connection error')
    }
  
};
