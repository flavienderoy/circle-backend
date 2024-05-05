# Circle :  Back-end

Ce projet constitue la partie back-end de l'application Circle.

### Installation

- **Cloner le dépôt depuis GitHub :**
  Vous pouvez cloner le dépôt en utilisant la commande `git clone https://github.com/flavienderoy/circle-backend.git`.

- **Installer les dépendances avec npm :**
  Utilisez la commande `npm install` pour installer toutes les dépendances nécessaires au projet pour pouvoir par la suite le démarrer.

- **Lancer le container MongoDB :**
  Vous pouvez démarrer un container Docker contenant MongoDB en utilisant la commande `docker-compose up -d`. Cela permettra de stocker les données de l'application. 
  NOTE : `-d` permet de rester sur la même console et éviter d'en ouvrir une autre pour les autres options.

- **Démarrer le serveur :**
  Pour lancer le serveur, utilisez la commande `npm start`. Le serveur démarrera, et vous pourrez accéder à l'API via `http://localhost:2415`.

- **Problèmes**
  1. En cas de problème, assurer vous de prendre en compte le `.env`: 
      - `cd "config"`
      - `npm i dotenv`
  2. Régler les données du `.env` et `db.js` à votre guise pour que cela marche sur votre machine.

### Utilisation

- Assurez-vous d'avoir installé MongoDB Compass pour visualiser et gérer les données MongoDB.

- Pour tester les endpoints de l'API, vous pouvez utiliser des outils comme Postman en envoyant des requêtes HTTP à l'adresse `http://localhost:2415/{route}`.
  (EXEMPLE : Créer un user, créer un poste, modifier un poste, ... à l'aide des routes dans `user.routes.js` et `post.routes.js`)

### Suite

Une fois que la partie Back-End fonctionne correctement, vous pouvez ainsi cloner la partie Front-End.

Projet Front-End : https://github.com/flavienderoy/circle-frontend