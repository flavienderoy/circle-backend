const userModel = require('../models/user.model')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.getAllUsers = async (req, res) => {
  const users = await userModel.find().select('-password')
  res.status(200).json(users)
}

module.exports.userInfo = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`ID unknown : ${req.params.id}`)

  userModel.findById(req.params.id)
    .select('-password')
    .then(docs => {
      if (docs) {
        res.send(docs)
      } else {
        console.log('ID unknown')
        // Gérer le cas où aucun document n'est trouvé avec cet ID
        res.status(404).send('ID unknown')
      }
    })
    .catch(err => {
      console.log('Error: ' + err)
      // Gérer l'erreur
      res.status(500).send('Internal Server Error')
    })
}

module.exports.updateUser = async (req, res) => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    return res.status(400).send(`ID unknown: ${id}`)
  }

  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      { $set: { bio: req.body.bio } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    if (!updatedUser) {
      return res.status(404).send('User not found')
    }

    return res.send(updatedUser)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

module.exports.deleteUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`ID unknown : ${req.params.id}`)

  try {
    const deletedUser = await userModel.findOneAndDelete({ _id: req.params.id })

    if (!deletedUser) {
      return res.status(404).send('User not found')
    }

    res.status(200).json({ message: 'Successfully deleted.' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports.follow = async (req, res) => {
  if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.idToFollow))
    return res.status(400).send(`ID unknown : ${req.params.id} or ${req.body.idToFollow}`)

  try {
    // Ajouter à la liste des followers
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    )

    if (!user) {
      return res.status(404).send('User not found')
    }

    // Ajouter à la liste des followers de l'utilisateur suivi
    const followedUser = await userModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    )

    if (!followedUser) {
      return res.status(404).send('User to follow not found')
    }

    // Envoyer une réponse avec les données mises à jour de l'utilisateur
    res.status(201).json(user)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports.unfollow = async (req, res) => {
  if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.idToUnfollow))
    return res.status(400).send(`ID unknown : ${req.params.id} or ${req.body.idToUnfollow}`)

  try {
    // Ajouter à la liste des followers
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } },
      { new: true, upsert: true }
    )

    if (!user) {
      return res.status(404).send('User not found')
    }

    // Ajouter à la liste des followers de l'utilisateur suivi
    const followedUser = await userModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true }
    )

    if (!followedUser) {
      return res.status(404).send('User to follow not found')
    }

    // Envoyer une réponse avec les données mises à jour de l'utilisateur
    res.status(201).json(user)

  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}