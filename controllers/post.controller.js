const PostModel = require('../models/post.model')
const UserModel = require('../models/user.model')
const ObjectID = require('mongoose').Types.ObjectId
const fs = require("fs")
const { promisify } = require("util")
const pipeline = promisify(require("stream").pipeline)
const { uploadErrors } = require("../utils/errors.utils")

module.exports.getAllPosts = async (req, res) => {
    const posts = await PostModel.find()
    res.status(200).json(posts)
}

module.exports.getAllPostsByUser = async (req, res) => {
    const userId = req.params.userId

    try {
        const userPosts = await PostModel.find({ posterId: userId })
        res.status(200).json(userPosts)
    } catch (error) {
        console.error("Error fetching user posts:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports.getAllPostsForHomeUser = async (req, res) => {
    const user = res.locals.user
    try {
        const posts = await PostModel.find({
            posterId: { $in: [ user._id, ...user.following ] }
        })
        res.status(200).json(posts)
    } catch (error) {
        console.error("Error fetching posts by users:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports.getAllPostsForPublicUser = async (req, res) => {
    const posts = await PostModel.find({ visibility: "public" })
    try {
        res.status(200).json(posts)
    } catch (error) {
        console.error("Error fetching public posts:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports.readPostById = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) res.send(docs)
        else console.log('Error to get data : ' + err)
    })
}

module.exports.createPost = async (req, res) => {
    let fileName
    console.log(req.file)
    if (req.file !== undefined) { // Vérifier si un fichier a été téléchargé
        const extension = req.file.mimetype.split("/")[ 1 ]
        fileName = req.body.posterId + Date.now() + '.' + extension

        // Chemin du fichier uploader
        const uploadedFilePath = req.file.path

        // Chemin du fichier qui sera renommé 
        const newFilePath = `${__dirname}/../client/public/uploads/posts/${fileName}`

        // Renommer le fichier 
        fs.rename(uploadedFilePath, newFilePath, (err) => {
            if (err) {
                console.error("Erreur lors du renommage du fichier :", err)
                // Gérer l'erreur ici
            } else {
                console.log("Fichier renommé avec succès !")
            }
        })
    }

    const newPost = new PostModel({
        posterId: req.body.posterId,
        message: req.body.message,
        visibility: req.body.visibility, // Ajouter la visibilité ici
        picture: fileName ? "./uploads/posts/" + fileName : "",
        video: req.body.video,
        likers: [],
        comments: []
    })

    try {
        const post = await newPost.save()
        return res.status(201).json(post)
    } catch (err) {
        return res.status(400).send(err)
    }
}

module.exports.updatePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    const updatedRecord = {
        message: req.body.message
    }

    try {
        const doc = await PostModel.findByIdAndUpdate(req.params.id, { $set: updatedRecord }, { new: true })

        if (!doc) {
            return res.status(404).send("Post not found")
        }

        res.send(doc)
    } catch (err) {
        console.log("Update error : " + err)
        return res.status(500).send("Update error: " + err)
    }
}



module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        const doc = await PostModel.findOneAndDelete({ _id: req.params.id })

        if (!doc) {
            return res.status(404).send("Post not found")
        }

        res.send(doc)
    } catch (err) {
        console.log("Delete error : " + err)
        return res.status(500).send("Delete error: " + err)
    }
}


module.exports.deleteAllPostsByUser = async (req, res) => {
    const userId = req.params.id

    try {
        const posts = await PostModel.find({ posterId: userId })

        for (const post of posts) {
            await PostModel.findOneAndDelete({ _id: post._id })
        }

        res.status(200).json({ success: true, message: "All posts of the user have been deleted." })
    } catch (error) {
        console.error("Error deleting user posts:", error)
        res.status(500).json({ success: false, message: "Failed to delete user posts." })
    }
}

module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id)

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likers: req.body.id },
            },
            { new: true }
        )

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id },
            },
            { new: true }
        )

        return res.status(201).json({ updatedPost, updatedUser })
    } catch (err) {
        return res.status(400).send(err)
    }
}


module.exports.unlikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id)

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id },
            },
            { new: true }
        )

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id },
            },
            { new: true }
        )

        return res.status(201).json({ updatedPost, updatedUser })
    } catch (err) {
        return res.status(400).send(err)
    }
}


module.exports.commentPost = async (req, res) => {
    try {
        const postId = req.params.id
        const { commenterId, commenterPseudo, text } = req.body

        if (!ObjectID.isValid(postId))
            return res.status(400).send("Invalid post ID")

        if (!ObjectID.isValid(commenterId))
            return res.status(400).send("Invalid commenterId")


        if (!commenterId || !commenterPseudo || !text)
            return res.status(400).send("Missing comment data")

        const updatedPost = await PostModel.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: {
                        commenterId,
                        commenterPseudo,
                        text,
                        timestamp: new Date().getTime(),
                    },
                }
            },
            { new: true }
        )

        if (!updatedPost)
            return res.status(404).send("Post not found")


        return res.status(200).json(updatedPost)
    } catch (err) {
        console.error("Error adding comment:", err)
        return res.status(500).send("Failed to add comment")
    }
}



module.exports.editCommentPost = async (req, res) => {
    try {
        const postId = req.params.id
        const commentId = req.body.commentId
        const newText = req.body.text

        if (!ObjectID.isValid(postId))
            return res.status(400).send("ID unknown : " + postId)

        const updatedPost = await PostModel.findById(postId)

        if (!updatedPost)
            return res.status(404).send("Post not found")

        const theComment = updatedPost.comments.find(comment =>
            comment._id.equals(commentId)
        )

        if (!theComment)
            return res.status(404).send("Comment not found")

        theComment.text = newText

        await updatedPost.save()

        return res.status(200).json(updatedPost)
    } catch (err) {
        console.error("Error editing comment:", err)
        return res.status(500).send("Failed to edit comment")
    }
}



module.exports.deleteCommentPost = async (req, res) => {
    try {
        const postId = req.params.id
        const commentId = req.body.commentId

        if (!ObjectID.isValid(postId))
            return res.status(400).send("Invalid post ID")

        if (!ObjectID.isValid(commentId))
            return res.status(400).send("Invalid comment ID")

        const updatedPost = await PostModel.findByIdAndUpdate(
            postId,
            {
                $pull: {
                    comments: {
                        _id: commentId,
                    },
                },
            },
            { new: true }
        )

        if (!updatedPost)
            return res.status(404).send("Post not found")

        return res.status(200).json(updatedPost)
    } catch (err) {
        console.error("Error deleting comment:", err)
        return res.status(500).send("Failed to delete comment")
    }
}
