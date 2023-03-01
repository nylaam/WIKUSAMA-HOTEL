const {request, response} = require("express");
const userModel = require(`../models/index`).user;
const Op = require(`sequelize`).Op;
const path = require(`path`)
const fs = require(`fs`)
const upload = require("./upload-user").single(`foto`);
const md5 =  require(`md5`);
const app = require("../routes/user.routes");
let password = md5(`password`);
const jsonwebtoken = require("jsonwebtoken")
const SECRET_KEY = "secretcode"

exports.login = async (req, res) => {
  try {
    const params = {
      email: req.body.email,
      password: md5(req.body.password),
    };

    console.log(params)
      const findUser = await userModel.findOne({ where: params});
      if (findUser == null) {
          return response.status(404).json({
              message: "email or password doesn't match",
              err: error,
          });
      }
      console.log(findUser)
      //generate jwt token
      let tokenPayLoad = {
          id_user: findUser.id_costumer,
          email: findUser.email,
          role: findUser.role,
      };
      tokenPayLoad = JSON.stringify(tokenPayLoad);
      let token = await jsonwebtoken.sign(tokenPayLoad,SECRET_KEY);

      return res.status(200).json({
          message: "Success login",
          data:{
              token: token,
              id_user: findUser.id_user,
              email: findUser.email,
              role: findUser.role,
          },
      });
  } catch (error){
      console.log(error);
      return response.status(500).json({
          message: "Internal error (account not regis)",
          err: error,
      });
  }
};

exports.getAllUser = async (request, response) => {
  let users = await userModel.findAll();
  return response.json({
    success: true,
    data: users,
    message: `All Users have been loaded`,
  });
};
exports.findUser = async (request, response) => {
  let nama_user = request.body.nama_user
  let email = request.body.email
  let role = request.body.role

  let users = await userModel.findAll({
    where: {
      [Op.or]: [
        { nama_user: { [Op.substring]: nama_user } },
        { email: { [Op.substring]: email } },
        { role: { [Op.substring]: role } },
      ],
    },
  });
  return response.json({
    success: true,
    data: users,
    message: `Users have been loaded`,
  });
};

exports.addUser = (request, response) => {
  upload(request, response, async (error) => {
    if (error) {
      console.log("err");
      return response.json({ message: error });
    }
    if (!request.file) {
      return response.json({ message: `Nothing file to Upload` });
    }

    //validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.body.email)) {
        return response.json({ 
          message: `Invalid email address` 
        });
      }
      
      //email sudah terpakai
      // let email = await modelUser.findOne({
      //   where: {
      //     email: request.body.email 
      //     }
      // })
      //   if (email !=null) {
      //   return response.json({ 
      //     message: `Email has been used` 
      //   })
      // }

  let newUser = {
    nama_user: request.body.nama_user,
    foto: request.file.filename,
    email: request.body.email,
    password: md5(request.body.password),
    role: request.body.role,
  };
  console.log(newUser);
  userModel
    .create(newUser)
    .then((result) => {
      return response.json({
        success: true,
        data: result,
        message: `New User has been inserted`,
      });
    })
    .catch((error) => {
      return response.json({
        succes: false,
        messagee: error.message,
      });
    });
  });
};

exports.updateUser = async (request, response) => {
  upload(request, response, async (err) => {
    if (err) {
      return response.json({ message: err });
    }
    let id = request.params.id;
    let dataUser = {
      nama_user: request.body.nama_user,
      foto: request.file.filename,
      email: request.body.email,
      password: md5(request.body.password),
      role: request.body.role,
    };
    console.log(dataUser);

    if (request.file) {
      /** get selected book's data */
      const selectedUser = await userModel.findOne({
        where: { id: id },
      });
      const oldFotoUser = selectedUser.foto;

      const pathImage = path.join(__dirname, `/../foto`, oldFotoUser);
      if (fs.existsSync(pathImage)) {
        fs.unlink(pathImage, (error) => console.log(error));
      }
      dataUser.foto = request.file.filename;
    }
    /** execute update data based on defined id book */
    userModel
      .update(dataUser, { where: { id: id } })
      .then((result) => {
        return response.json({
          success: true,
          message: `Data user has been updated`,
        });
      })
      .catch((error) => {
        return response.json({
          success: false,
          message: error.message,
        });
      });
  });
};
exports.deleteUser = async (request, response) => {
  let idUser = request.params.id;

  const user = await userModel.findOne({ wher: { id: idUser } });

  const oldFotoUser = user.foto;

  const patchFoto = path.join(__dirname, `../foto`, oldFotoUser);

  if (fs.existsSync(patchFoto)) {
    fs.unlink(patchFoto, (error) => console.log(error));
  }

  userModel
    .destroy({ where: { id: idUser } })

    .then((result) => {
      return response.json({
        success: true,
        message: `data user has ben delete where id_user :` + idUser,
      });
    })
    .catch((error) => {
      return response.json({
        success: false,
        message: error.message,
      });
    });
};