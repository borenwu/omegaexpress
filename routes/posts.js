/**
 * Created by Administrator on 2017/11/9.
 */
const express = require('express');
const multer = require('multer');
const qn = require('qn')
const router = express.Router();
const fs = require('fs')
const Post = require('../models/PostModel')
const moment = require('moment')

// 配置multer
// 详情请见https://github.com/expressjs/multer
let createFolder = function (folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};

let uploadFolder = '../public/images/my-uploads';

// 通过 filename 属性定制
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.originalname);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
let upload = multer({storage: storage})

// 七牛云配置
let bucket = 'ntboao'
const client = qn.create({
// 秘钥在控制模板->个人中心->密钥管理中可以看到
    accessKey: 'rsnQ1mPiWJwthOmbSSIfwvsKkNX0ZzTrISaLMlM0',
    secretKey: 'Gu00U4X8-KUgHIAybg4TeeZnhjRX5d7-Dn8Jo89M',
// 空间名
    bucket: bucket,
// 这个是你要生成的前缀（你的外链地址，可以在空间中查看）
// 其实写不写都行，不写后面也得写.
    origin: 'http://oy98650kl.bkt.clouddn.com',
    timeout: 3600000, // default rpc timeout: one hour, optional
})


//===========================  apis   ====================================================

/* GET post index page. */
router.get('/', function (req, res, next) {
    res.render('posts/index');
});

router.get('/admin', function (req, res, next) {
    res.render('posts/admin')
})


/* POST a post */
router.post('/upload', upload.array('file'), function (req, res, next) {
    let files = req.files
    let dirname = req.body.dirname
    let tag = req.body.tag
    let area = req.body.area

    files.forEach(function (file) {
        let filename = file.originalname
        let path = file.path
        // console.log(path)

        client.uploadFile(file.path, {key: `/${dirname}/${filename}`}, function (err, result) {
            if (err) {
                console.log('上传失败')
                console.log(err)
            } else {
                let store_url = {url: result.url};
                // images.push(store_url)
                console.log("上传完成: " + result.url)
                Post.findOne({title: dirname}, function (err, post) {
                    if (post == null) {
                        let newPost = Post({
                            title: dirname,
                            date: moment(),
                            tag:tag,
                            images: [store_url],
                            area: area
                        });
                        newPost.save(function (err) {
                            if (err) throw err;
                        });
                    }
                    else{
                        post.images.push(store_url)
                        post.save(function (err) {
                            if (err) throw err;
                        });
                    }
                })
                // 上传之后删除本地文件
                fs.unlinkSync(file.path);
            }
        });

    })

    res.redirect('/posts/admin');
    // res.json({mesage:'0'})
})


module.exports = router;