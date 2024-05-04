const router = require('express').Router();
const postController = require('../controllers/post.controller'); 
const multer = require("multer");
const upload = multer(multer({ dest: "./client/public/uploads/posts/" }));

router.get('/', postController.getAllPosts);
router.get('/user/:userId', postController.getAllPostsByUser);
router.get('/:id', postController.readPostById);
router.post('/',upload.single("file"), postController.createPost);
router.put('/:id', postController.updatePost); 
router.delete('/:id', postController.deletePost);
router.delete('/user/:id', postController.deleteAllPostsByUser);
router.patch('/like-post/:id', postController.likePost);
router.patch('/unlike-post/:id', postController.unlikePost);


router.patch('/comment-post/:id', postController.commentPost);
router.patch('/edit-comment-post/:id', postController.editCommentPost);
router.patch('/delete-comment-post/:id', postController.deleteCommentPost);

module.exports = router;