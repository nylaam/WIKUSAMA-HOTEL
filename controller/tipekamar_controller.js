const {request, response} = require("express");
const tipekamarModel = require(`../models/index`).tipe_kamar;
const Op = require(`sequelize`).Op;
const path = require(`path`)
const fs = require(`fs`)
const upload = require("./upload-tk").single(`foto`);

exports.getAllTipe = async (request, response) => {
  let tipekamars = await tipekamarModel.findAll();
  return response.json({
    success: true,
    data: tipekamars,
    message: `All room type have been loaded`,
  });
};
exports.findTipe = async (request, response) => {
  let nama_tipe_kamar = request.body.nama_tipe_kamar
  let harga = request.body.harga
  let deskripsi = request.body.deskripsi

  let tipekamars = await tipekamarModel.findAll({
    where: {
      [Op.or]: [
        { nama_tipe_kamar: { [Op.substring]: nama_tipe_kamar } },
        { harga: { [Op.substring]: harga } },
        { deskripsi: { [Op.substring]: deskripsi } },
      ],
    },
  });
  return response.json({
    success: true,
    data: tipekamars,
    message: `All room type have been loaded`,
  });
};

exports.addTipe = (request, response) => {
  upload(request, response, async (error) => {
    if (error) {
      console.log("err");
      return response.json({ message: error });
    }
    if (!request.file) {
      return response.json({ message: `Nothing file to Upload` });
    }
  let newTipe = {
    nama_tipe_kamar: request.body.nama_tipe_kamar,
    harga: request.body.harga,
    deskripsi: request.body.deskripsi,
    foto: request.file.filename,
  };
  console.log(newTipe);
  tipekamarModel.create(newTipe)
    .then((result) => {
      return response.json({
        success: true,
        data: result,
        message: `New room type has been inserted`,
      });
    })
    .catch((error) => {
      return response.json({
        succes: false,
        message: error.message,
      });
    });
  });
};

exports.updateTipe = async (request, response) => {
  upload(request, response, async (err) => {
    if (err) {
      return response.json({ message: err });
    }
    let id = request.params.id;
    let dataTipe = {
        nama_tipe_kamar: request.body.nama_tipe_kamar,
        harga: request.body.harga,
        deskripsi: request.body.deskripsi,
        foto: request.file.filename,
    };
    console.log(dataTipe);

    if (request.file) {
      const selectedTipe = await tipekamarModel.findOne({
        where: { id: id },
      });
      const oldFotoTipe = selectedTipe.foto;

      const pathImage = path.join(__dirname, `/../foto_tipe`, oldFotoTipe);
      if (fs.existsSync(pathImage)) {
        fs.unlink(pathImage, (error) => console.log(error));
      }
      dataTipe.foto = request.file.filename;
    }
    tipekamarModel
      .update(dataTipe, { where: { id: id } })
      .then((result) => {
        return response.json({
          success: true,
          message: `Data room type has been updated`,
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
exports.deleteTipe = (request, response) => {
  let idTipe = request.params.id;
  tipekamarModel
    .destroy({ where: { id: idTipe } })
    .then((result) => {
      return response.json({
        success: true,
        message: `Data room type has been updated`,
      });
    })
    .catch((error) => {
      return response.json({
        success: false,
        message: error.message,
      });
    });
};