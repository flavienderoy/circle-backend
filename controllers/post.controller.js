const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log('Error to get data : ' + err);
    });
};
 
module.exports.createPost = async (req, res) => {
    const newPost = new PostModel({
        posterId: req.body.posterId,
        message: req.body.message,
        video: req.body.video,
        likers: [],
        comments: []
    });

    try {
        const post = await newPost.save();
        return res.status(201).json(post);
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.updatePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    const updatedRecord = {
        message: req.body.message
    };

    try {
        const doc = await PostModel.findByIdAndUpdate(req.params.id, { $set: updatedRecord }, { new: true });
        
        if (!doc) {
            return res.status(404).send("Post not found");
        }

        res.send(doc);
    } catch (err) {
        console.log("Update error : " + err);
        return res.status(500).send("Update error: " + err);
    }
};



module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        const doc = await PostModel.findOneAndDelete({ _id: req.params.id });
        
        if (!doc) {
            return res.status(404).send("Post not found");
        }

        res.send(doc);
    } catch (err) {
        console.log("Delete error : " + err);
        return res.status(500).send("Delete error: " + err);
    }
};

module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: { likers: req.body.id },
        },
        { new: true }
      );

      const updatedUser = await UserModel.findByIdAndUpdate(
        req.body.id,
        {
          $addToSet: { likes: req.params.id },
        },
        { new: true }
      );

      return res.status(201).json({ updatedPost, updatedUser });
    } catch (err) {
      return res.status(400).send(err);
    }
  };

 
  module.exports.unlikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.id },
        },
        { new: true }
      );

      const updatedUser = await UserModel.findByIdAndUpdate(
        req.body.id,
        {
          $pull: { likes: req.params.id },
        },
        { new: true }
      );

      return res.status(201).json({ updatedPost, updatedUser });
    } catch (err) {
      return res.status(400).send(err);
    }
};

  
module.exports.commentPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { commenterId, commenterPseudo, text } = req.body;

        // Vérifier si l'ID du poste est valide
        if (!ObjectID.isValid(postId))
            return res.status(400).send("Invalid post ID");

        // Vérifier que toutes les données du commentaire sont présentes
        if (!commenterId || !commenterPseudo || !text)
            return res.status(400).send("Missing comment data");

        // Ajouter le commentaire au poste
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
                },
            },
            { new: true }
        );

        // Vérifier si le poste a été trouvé et mis à jour
        if (!updatedPost)
            return res.status(404).send("Post not found");

        // Retourner le poste mis à jour en réponse
        return res.status(200).json(updatedPost);
    } catch (err) {
        console.error("Error adding comment:", err);
        return res.status(500).send("Failed to add comment");
    }
};


module.exports.editCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      const updatedPost = await PostModel.findById(req.params.id);

      const theComment = updatedPost.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );

      if (!theComment) 
        return res.status(404).send("Comment not found");

      theComment.text = req.body.text;

      await updatedPost.save();
      
      return res.status(200).json(updatedPost);
    } catch (err) {
      return res.status(500).send(err);
    }
  };

module.exports.deleteCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            comments: {
              _id: req.body.commentId,
            },
          },
        },
        { new: true }
      );

      return res.status(200).json(updatedPost);
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  