const UserModel = require("../models/user.model");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const { uploadErrors } = require("../utils/errors.utils");


module.exports.uploadProfil = async (req, res) => {
  console.log(req.body.name)
  console.log(req.file)

  // extension du fichier
  const extension = req.file.mimetype.split("/")[1];
  // nom user qui devien nom du fichier
  const fileUserName = req.body.name + "." + extension;

  // Chemin du fichier uploader
const uploadedFilePath = `${__dirname}/../client/public/uploads/profil/${req.file.filename}`;

// Chemin du fichier qui sera renommé avec le nom de l'utilisateur
const newFilePath = `${__dirname}/../client/public/uploads/profil/${fileUserName}`;

// Renommer le fichier
fs.rename(uploadedFilePath, newFilePath, (err) => {
  if (err) {
    console.error("Erreur lors du renommage du fichier :", err);
    // Gérer l'erreur ici
  } else {
    console.log("Fichier renommé avec succès !");
  }
});


try {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.body.userId,
    { $set: { picture: "./client/public/uploads/profil/" + fileUserName } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).exec();
  if (!updatedUser) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }
  return res.json(updatedUser);
} catch (err) {
  return res.status(500).send({ message: "Une erreur s'est produite lors de la mise à jour de l'utilisateur" });
}
};