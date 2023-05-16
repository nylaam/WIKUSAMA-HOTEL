const pemesananModel = require(`../models/index`).pemesanan;
const detailsOfPemesananModel = require(`../models/index`).detail_pemesanan;
const userModel = require(`../models/index`).user;
const roomModel = require(`../models/index`).kamar;
const tipeKamarModel = require(`../models/index`).tipe_kamar;

const Op = require(`sequelize`).Op;
// const date = require(`date-and-time`);
const Sequelize = require("sequelize");
const sequelize = new Sequelize("hotelwikusama", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

//tambah data
exports.addPemesanan = async (request, response) => {
  let nomor_kamar = request.body.nomor_kamar;
  let room = await roomModel.findOne({
    where: {
      [Op.and]: [{ nomor_kamar: { [Op.substring]: nomor_kamar } }],
    },
    attributes: ["id", "nomor_kamar", "tipeKamarId", "createdAt", "updatedAt"],
    include: [
      {
        model: tipeKamarModel,
        attributes: ["harga"],
      },
    ],
  });

  let nama_user = request.body.nama_user;
  let id_user = await userModel.findOne({
    where: {
      [Op.and]: [{ nama_user: { [Op.substring]: nama_user } }],
    },
  });

  if (room === null) {
    return response.json({
      success: false,
      message: `Kamar yang anda inputkan tidak ada`,
    });
  } else if (id_user === null) {
    return response.json({
      success: false,
      message: `User yang anda inputkan tidak ada`,
    });
  } else {
    let newData = {
      nomor_pemesanan: request.body.nomor_pemesanan,
      nama_pemesan: request.body.nama_pemesan,
      email_pemesan: request.body.email_pemesan,
      tgl_pemesan: Date.now(),
      tgl_check_in: request.body.check_in,
      tgl_check_out: request.body.check_out,
      nama_tamu: request.body.nama_tamu,
      jumlah_kamar: 1, // Hanya satu jumlah kamar yang diizinkan
      tipeKamarId: room.tipeKamarId,
      status_pemesanan: request.body.status,
      userId: id_user.id,
    };
    console.log(newData);
    let roomCheck = await sequelize.query(
      `SELECT * FROM detail_pemesanans WHERE id_kamar = ${room.id} AND tgl_akses >= "${request.body.check_in}" AND tgl_akses <= "${request.body.check_out}" ;`
    );

    if (roomCheck[0].length === 0) {
      const tglCheckIn = new Date(request.body.check_in);
      const tglCheckOut = new Date(request.body.check_out);
      const diffTime = Math.abs(tglCheckOut - tglCheckIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      pemesananModel
        .create(newData)
        .then((result) => {
          let pemesananID = result.id;
          // let detailsOfPemesanan = request.body.details_of_pemesanan;
          let detailData = [];

          for (let i = 0; i <= diffDays; i++) {
            let newDetail = {
              id_pemesanan: pemesananID,
              id_kamar: room.id,
              tgl_akses: new Date(
                tglCheckIn.getTime() + i * 24 * 60 * 60 * 1000
              ),
              harga: room.tipe_kamar.harga,
            };
            detailData.push(newDetail);
          }

          detailsOfPemesananModel
            .bulkCreate(detailData)
            .then((result) => {
              return response.json({
                success: true,
                message: `New transaction has been inserted`,
              });
            })
            .catch((error) => {
              return response.json({
                success: false,
                message: error.message,
              });
            });
        })
        .catch((error) => {
          return response.json({
            success: false,
            message: error.message,
          });
        });
    } else {
      return response.json({
        success: false,
        message: `Kamar yang anda pesan sudah di booking`,
      });
    }
  }
};

//update data
exports.updatePemesanan = async (request, response) => {
  let nomor_kamar = request.body.nomor_kamar;
  let room = await roomModel.findOne({
    where: {
      [Op.and]: [{ nomor_kamar: { [Op.substring]: nomor_kamar } }],
    },
    attributes: ["id", "nomor_kamar", "tipeKamarId", "createdAt", "updatedAt"],
  });

  let nama_user = request.body.nama_user;
  let id_user = await userModel.findOne({
    where: {
      [Op.and]: [{ nama_user: { [Op.substring]: nama_user } }],
    },
  });

  let newData = {
    nomor_pemesanan: request.body.nomor_pemesanan,
    nama_pemesan: request.body.nama_pemesan,
    email_pemesan: request.body.email_pemesan,
    tgl_pemesan: request.body.tgl_pemesan,
    tgl_check_in: request.body.check_in,
    tgl_check_out: request.body.check_out,
    nama_tamu: request.body.nama_tamu,
    jumlah_kamar: 1, // Hanya satu jumlah kamar yang diizinkan
    tipeKamarId: room.tipeKamarId,
    status_pemesanan: request.body.status,
    userId: id_user.id,
  };

  let pemesananID = request.params.id;

  try {
    const existingPemesanan = await pemesananModel.findByPk(pemesananID);

    if (!existingPemesanan) {
      return response.json({
        success: false,
        message: `Pemesanan dengan ID ${pemesananID} tidak ditemukan`,
      });
    }

    await existingPemesanan.update(newData);

    return response.json({
      success: true,
      message: `Pemesanan dengan ID ${pemesananID} berhasil diperbarui`,
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message,
    });
  }
};


//delete data
exports.deletePemesanan = async (request, response) => {
  let pemesananID = request.params.id;

  detailsOfPemesananModel
    .destroy({
      where: { id_pemesanan: pemesananID },
    })
    .then((result) => {
      pemesananModel
        .destroy({ where: { id: pemesananID } })
        .then((result) => {
          return response.json({
            success: true,
            message: `Transaction has been deleted`,
          });
        })
        .catch((error) => {
          return response.json({
            success: false,
            message: error.message,
          });
        });
    })
    .catch((error) => {
      return response.json({
        success: false,
        message: error.message,
      });
    });
};

//mendapatkan semua data
exports.getAllPemesanan = async (request, response) => {
  const result = await pemesananModel.findAll({
    include: {
      model: tipeKamarModel,
      attributes: ['nama_tipe_kamar']
    }
  });
  if (result.length === 0) {
    return response.json({
      success: true,
      data: [],
      message: "Data tidak ditemukan",
    })
  }

  response.json({
    success: true,
    data: result,
    message: `All Transaction have been loaded...`,
  });
};

//mendapatkan salah satu data
exports.find = async (request, response) => {
  let status = request.body.status;

  const result = await pemesananModel.findAll({
    where: {
      [Op.and]: [{ status_pemesanan: status }],
    },
  });

  return response.json({
    success: true,
    data: result,
    message: `Transaction have been loaded`,
  });
};

exports.updateStatusBooking = async (req, res) => {
  try {
    const params = { id: req.params.id };

    const result = await pemesananModel.findOne({ where: params });
    if (!result) {
      return res.status(404).json({
        message: "Data not found!",
      });
    }

    const data = {
      status_pemesanan: req.body.status_pemesanan,
    };

    if (data.status_pemesanan === "check_out") {
      await pemesananModel.update(data, { where: params });

      const updateTglAccess = {
        tgl_akses: null,
      };
      await detailsOfPemesananModel.update(updateTglAccess, { where: params });
      return res.status(200).json({
        message: "Success update status booking to check out",
        code: 200,
      });
    }

    await pemesananModel.update(data, { where: params });
    return res.status(200).json({
      message: "Success update status booking",
      code: 200,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal error",
      err: err,
    });
  }
};
