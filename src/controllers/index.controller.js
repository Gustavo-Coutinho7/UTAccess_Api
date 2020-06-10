const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authconfig  = require ('../config/auth.json');

function generateToken(params ={}) {
  return jwt.sign({params}, authconfig.secret, {
    expiresIn: 86400,
  });

}
const pool = new Pool ({
    user: "qghyxsxu",
    host: "motty.db.elephantsql.com",
    database: "qghyxsxu",
    password: "DHHRL0s3q9joweMfC6x5Z-LkVrjeBHIf",
    port: 5432,
})

const Unique = async(req, res, next)=>{
  try {

    const { name, email, password} = req.body;
    const nameunique = await pool.query("SELECT * FROM users WHERE name = $1", [name]);
    const emailunique = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if( nameunique.rows.length  == 1 ){
      res.status(400).send({error: "Usuario existente" });
    }
    else if(emailunique.rows.length == 1) {
      res.status(400).send({error: "Email existente" });
    }
    else {
      next();
    }
  } catch (error) {
    
    return res.status(401).send({error: "Invalid token"})
  }
}

const createUser = async (req, res, next) =>{
const { name, email, password} = req.body;
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

const response = await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name, email, hash] );
const idresponse = await pool.query("SELECT * FROM users WHERE name = $1", [name]);
const id = idresponse.rows[0].id;

  console.log(response.rows);
  res.status(200).json({
         auth: "OK", 
          user: {
            name, 
            email,
            id,
            token: generateToken({id: name})
          }
  });
  next();
}

const authUser = async (req, res) => {
  const { email, password } = req.body;
  const response = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if ( response.rows.length == 1 && bcrypt.compareSync(password, response.rows[0].password))
  {
    //auth ok
      const id =  response.rows[0].id;
      const name =response.rows[0].name;
     const email= response.rows[0].email;
     const token= generateToken({id: this.name})
    res.status(200).send(
      { auth: "OK",
      user: {
        name, 
        email,
        id,
        token,
      }
   })
  } 
   else {
    res.status(400).send({auth: "Error",error: "Wrong user or password" });
  }
  } 

const Token = async (req, res, next) => {
  try {
    const decode = await jwt.verify(req.body.token, authconfig.secret)
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).send({error: "Invalid token"})
  }
}

const updateUser = async (req, res) => {
const id = req.params.id;
const { name, email, password } = req.body;

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

  const queryLogin = "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4";
  const values = [name, email, hash, id];
  const response = await pool.query(queryLogin, values);

  console.log(response.rows)
  res.status(200).json({
    message: "User updated succesfuly", 
    id: req.params.id,       
    user: {
              name, 
              email,
              password
            }
    });
  }

  const createFavorito = async (req, res) =>{
    const { name} = req.body;
    const idresponse = await pool.query("SELECT * FROM users WHERE name = $1", [name]);
    const id = idresponse.rows[0].id;
    const response = await pool.query("INSERT INTO favoritos (id_user, nome_local, endereco) VALUES ($1, $2, $3)", [id, "Casa", "toque para inserir um endereço"] );
    const response2 = await pool.query("INSERT INTO favoritos (id_user, nome_local, endereco) VALUES ($1, $2, $3)", [id, "Trabalho", "toque para inserir um endereço"] );
    res.status(200).json(response.rows, response2.rows);
  }
    
  const addFavorito = async (req, res) =>{
    const id = req.params.id;
    const { nome_local, endereco} = req.body;  
    const response = await pool.query("INSERT INTO favoritos (id_user, nome_local, endereco) VALUES ($1, $2, $3)", [id, nome_local, endereco] );

    res.status(200).send(
      {auth: "OK",
    response
    }
    )
  }

  const addRecente = async (req, res) =>{
    const id = req.params.id;
    const { latitude, longitude, title, adress} = req.body;  
    const response = await pool.query("INSERT INTO recentes (id_user, latitude, longitude, title, adress) VALUES ($1, $2, $3, $4, $5)", [id,  latitude, longitude, title, adress] );
    res.status(200).send(
      {auth: "OK",
      response,
    }
    )
  }

  const Recentes = async (req, res) =>{
    const id = req.params.id;
    const { num_reg} = req.body;  
    const response = await pool.query("SELECT * FROM recentes WHERE id_user = $1  ORDER BY id desc LIMIT $2 ", [id, num_reg]);
    console.log(response.rows);
    res.status(200).json(response.rows);
  }

  const   Favoritos = async (req, res) =>{
    const id = req.params.id;
    const response = await pool.query("SELECT * FROM favoritos WHERE id_user = $1", [id]);
    console.log(response.rows);
    res.status(200).json(response.rows);
  }

  const Destino = async (req, res) => {
    const id = req.params.id;
    const queryLogin = "SELECT * FROM recentes WHERE id = (SELECT  MAX(id) FROM recentes where id_user = $1)";
    const response = await pool.query(queryLogin, [id]);
        const latitude =  response.rows[0].latitude;
        const longitude =response.rows[0].longitude;
       const title= response.rows[0].title;
       console.log(response)
      res.status(200).send(
       { destino: {
          latitude, 
          longitude,
          title,
        }}
      )
    }

    const AuthToken = async (req, res) => {
      res.status(200).send(
       { auth: "OK"}
      )
    }
module.exports = {
  Favoritos,
  Recentes,
  createUser,
  authUser,
  updateUser,
  Token,
  Unique,
  createFavorito,
  addFavorito,
  addRecente,
  Destino,
  AuthToken
}