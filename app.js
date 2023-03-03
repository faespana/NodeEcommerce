require("dotenv").config()

// 1. Importamos el modelo
const Server = require("./models/server")

//2. Instanciamos el servidor o la clase
const server = new Server()

//3. Pongo a escuchar mi servidor
server.listen()