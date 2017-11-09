const express = require('express');
const router = express.Router();
const Post = require('../models/PostModel')
const moment = require('moment')

/* GET home page. */
router.get('/', function(req, res, next) {
    Post.find({},(err, posts) => {
        if (err){
            console.log(handleError(err));
        }
        posts.forEach(function (post) {
            post.thumb = post.images[0].url
            post.dateString = moment(post.date).format('YYYY-MM-DD')
            console.log(post.thumb)
            console.log(post.dateString)
        })
        res.render('index', { posts: posts });
    });
});



module.exports = router;
