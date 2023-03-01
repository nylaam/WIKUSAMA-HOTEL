const { request, response } = require("express");
const { findTipeKamar } = require("./tipekamar_controller");
const kamarModel = require("../models/index").kamar;
const Op = require(`sequelize`).Op;

exports.getAllKamar = async (request, response) => {
  let kamars = await kamarModel.findAll();
  return response.json({
    success: true,
    data: kamars,
    message: `All rooms have been loaded`,
  });
};
exports.findKamar = async (request, response) => {
  let nomor_kamar = request.body.nomor_kamar;
  let tipeKamarId = request.body.tipeKamarId;

  let kamars = await kamarModel.findAll({
    where: {
      [Op.or]: [
        { nomor_kamar: { [Op.substring]: nomor_kamar } },
        { tipeKamarId: { [Op.substring]: tipeKamarId } },
      ],
    },
  });
  return response.json({
    success: true,
    data: kamars,
    message: `All rooms have been loaded`,
  });
};
exports.addKamar = async (request, response) => {
  let kamar_nomor = await kamarModel.findOne({
    where: {
      nomor_kamar: request.body.nomor_kamar
    }
  })
  if (kamar_nomor !=null){
    return response.json({
      message: `꧋ꦤꦺꦴꦩꦺꦴꦂꦄꦼꦮꦼꦱ꧀ꦏꦼꦒꦮꦺ`
    })
  }
  let newKamar = {
    nomor_kamar: request.body.nomor_kamar,
    tipeKamarId: request.body.tipeKamarId,
  };
  console.log(newKamar);
  kamarModel
    .create(newKamar)
    .then((result) => {
      return response.json({
        success: true,
        data: result,
        message: `New room has been inserted`,
      });
    })
    .catch((error) => {
      return response.json({
        succes: false,
        message: error.message,
      });
    });
};
exports.updateKamar = async (request, response) => {
  let dataKamar = {
      nomor_kamar: request.body.nomor_kamar,
      tipeKamarId: request.body.tipeKamarId,
  };
  let id = request.params.id;
  kamarModel
      .update(dataKamar, { where: { id: id } })
      .then((result) => {
          return response.json({
              success: true,
              message: `Data room has been updated`,
          });
      })
      .catch((error) => {
          return response.json({
              success: false,
              message: error.message,
          });
      });
};
exports.deleteKamar = (request, response) => {
  let idKamar = request.params.id;
  kamarModel
    .destroy({ where: { id: idKamar } })
    .then((result) => {
      return response.json({
        success: true,
        message: `Data room has been updated`,
      });
    })
    .catch((error) => {
      return response.json({
        success: false,
        message: error.message,
      });
    });
};