const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const { Campaign, Donation } = require("../models");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");
const path = require("path");
const fs = require("fs");
const ROLES = require("../utils/roles");
const updateTotalDonation = async (campaignId) => {
  const donations = await Donation.find({ campaignId, deletedAt: null });

  let totalDonation = 0;
  donations.forEach((donation) => {
    if (donation.isDone === true) {
      totalDonation += donation.amount;
    }
  });

  await Campaign.findOneAndUpdate({ _id: campaignId }, { totalDonation });
};

const updateCampaignStatusByDate = async () => {
  try {
    // Ambil semua campaign yang sedang berjalan dan belum dihapus
    const ongoingCampaigns = await Campaign.find({
      statusCampaign: "On Going",
      deletedAt: null,
    });

    const today = new Date();

    const updatePromises = ongoingCampaigns.map(async (campaign) => {
      // Jika endDate sudah lewat, ubah status menjadi "Done"
      if (new Date(campaign.endDate) < today) {
        campaign.statusCampaign = "Done";
        await campaign.save();
      }
    });

    // Tunggu semua update selesai
    await Promise.all(updatePromises);
  } catch (error) {
    console.error(
      "Error memperbarui status campaign berdasarkan tanggal:",
      error
    );
  }
};

const updateAllCampaignDonations = async (campaigns) => {
  const updatePromises = campaigns.map((campaign) =>
    updateTotalDonation(campaign._id)
  );
  await Promise.all(updatePromises);
};

const campaignController = {
  // Create Campaign
  async Create(req, res, next) {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        targetAmount,
        categoryId,
      } = req.body;
      console.log(req.body);
      const userId = req.user._id;

      if (!req.user || req.user.isKYC !== true) {
        return next({
          name: "KYC_ERROR",
          message: "Verifikasi KTP diperlukan sebelum membuat kampanye",
        });
      }

      // Pastikan file foto ada
      if (!req.file) {
        return next({
          name: "ValidationError",
          message: "Foto kampanye diperlukan",
        });
      }

      // Jika campaign ada dan sudah punya foto, hapus file lama
      if (req.params._id) {
        const checkOldFile = await Campaign.findOne({
          _id: req.params._id,
          deleteAt: null,
        });

        if (checkOldFile && checkOldFile.photo) {
          const oldFilePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            "upload",
            checkOldFile.photo
          );
          console.log("Path yang dibentuk:", oldFilePath);

          // Menghapus file lama
          fs.unlink(oldFilePath, (err) => {
            if (err) console.log(err);
            else {
              console.log("\nDeleted file:", checkOldFile.photo);
            }
          });
        }
      }

      // Membuat campaign baru dengan foto yang baru di-upload
      const newCampaign = await Campaign.create({
        userId,
        categoryId,
        title,
        description,
        photo: req.file.filename, // Menyimpan nama file foto yang di-upload
        startDate,
        endDate,
        targetAmount,
      });

      // Mengirim response sukses dengan data campaign yang baru dibuat
      ResponseAPI.success(res, newCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Get Campaign by User ID
  async ReadByUserId(req, res, next) {
    try {
      const userId = req.user._id;

      // Update status campaign berdasarkan tanggal
      await updateCampaignStatusByDate();

      // Mencari campaign berdasarkan userId dan memastikan campaign aktif (deletedAt: null)
      const findCampaignsByUser = await Campaign.find({
        userId: userId,
        deletedAt: null,
      })
        .populate("userId", "name")
        .populate("categoryId", "title");

      // Update total donation untuk semua campaign yang ditemukan
      await updateAllCampaignDonations(findCampaignsByUser);

      if (findCampaignsByUser.length === 0) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaignsByUser);
    } catch (error) {
      next(error);
    }
  },

  // Read Campaign by ID
  async ReadById(req, res, next) {
    try {
      const campaignId = req.params._id;

      // Update status campaign berdasarkan tanggal
      await updateCampaignStatusByDate();

      // Update total donation untuk campaign yang diminta
      await updateTotalDonation(campaignId);

      const findCampaign = await Campaign.findOne({
        _id: campaignId,
        deletedAt: null,
      }).populate("userId", "name");

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Read All Campaign
  async Read(req, res, next) {
    try {
      let findCampaign = null;
      if (req.query.isHome === "true") {
        findCampaign = await Campaign.find({
          deletedAt: null,
          statusCampaign: "On Going",
        })
          .populate("userId", "name")
          .populate("categoryId", "title"); // Hanya campaign aktif
        // Update total donation untuk semua campaign yang ditemukan
      } else {
        findCampaign = await Campaign.find({
          deletedAt: null,
          statusCampaign: "On Going",
        })
          .populate("userId", "name")
          .populate("categoryId", "title"); // Hanya campaign aktif
        // Update total donation untuk semua campaign yang ditemukan
      }

      await updateAllCampaignDonations(findCampaign);

      // Update status campaign berdasarkan tanggal
      await updateCampaignStatusByDate();

      if (findCampaign.length === 0) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  async Upload(req, res, next) {
    try {
      // Cek apakah campaign ada dan belum dihapus
      const checkOldFile = await Campaign.findOne({
        _id: req.params._id,
        deleteAt: null,
      });

      // Jika ada file lama, hapus file tersebut
      if (checkOldFile && checkOldFile.photo) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "upload",
          checkOldFile.photo
        );
        console.log("Path yang dibentuk:", oldFilePath);

        // Menggunakan fs.promises.unlink untuk menghapus file dengan menangani error
        fs.unlink(oldFilePath, (err) => {
          if (err) console.log(err);
          else {
            console.log("\nDeleted file: example_file.txt");
          }
        });
      }

      // Update campaign dengan foto baru
      const updatedCampaign = await Campaign.findOneAndUpdate(
        { _id: req.params._id, deleteAt: null },
        { photo: req.file.filename, updateAt: new Date() },
        { new: true }
      );

      // Jika campaign tidak ditemukan
      if (!updatedCampaign) {
        return next({
          name: "NotFoundError",
          message: "Campaign tidak ditemukan",
        });
      }

      // Kirim respons sukses setelah update
      return ResponseAPI.success(res, updatedCampaign); // Pastikan return di sini
    } catch (error) {
      // Tangani error secara umum
      console.error(error);
      next(error);
    }
  },

  // Update Campaign
  async Update(req, res, next) {
    try {
      const {
        title,
        description,
        photo,
        startDate,
        endDate,
        targetAmount,
        categoryId,
      } = req.body;

      // Validasi campaign
      const findCampaign = await Campaign.findOne({
        _id: req.params._id,
        deletedAt: null,
      });

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      // Update properti jika ada
      if (title) findCampaign.title = title;
      if (description) findCampaign.description = description;
      if (photo) findCampaign.photo = photo;
      if (startDate) findCampaign.startDate = startDate;
      if (endDate) findCampaign.endDate = endDate;
      if (targetAmount) findCampaign.targetAmount = targetAmount;
      if (categoryId) findCampaign.categoryId = categoryId;

      await findCampaign.save();

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Soft Delete Campaign
  async Delete(req, res, next) {
    try {
      const findCampaign = await Campaign.findOneAndUpdate(
        { _id: req.params._id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  async updateStatusCampaign(req, res, next) {
    try {
      const { _id, newStatus } = req.params;
      console.log(req.user.role, ROLES.ADMIN);
      if (req.user.role !== ROLES.ADMIN) {
        return ResponseAPI.forbidden(
          res,
          "Hanya admin yang dapat mengubah status kampanye"
        );
      }

      const findCampaign = await Campaign.findOne({
        _id: _id,
        deletedAt: null,
      });
      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      console.log(newStatus);
      if (!["Unpublished", "On Going", "Done"].includes(newStatus)) {
        return next({
          name: errorName.VALIDATION_ERROR,
          message: errorMsg.INVALID_CAMPAIGN_STATUS,
        });
      }
      // Update status
      findCampaign.statusCampaign = newStatus;
      await findCampaign.save();
      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  async updateStatusTransfer(req, res, next) {
    try {
      const { _id, newStatus } = req.params; // Ambil newStatus dari URL
      const { accountNumber, bankName } = req.body;

      // Temukan campaign berdasarkan ID
      const findCampaign = await Campaign.findOne({
        _id: _id,
        deletedAt: null,
      });

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      // Cek peran user
      if (req.user.role === ROLES.USER) {
        // User hanya bisa mengubah status ke "On Progress"
        if (newStatus !== "On Progress") {
          return ResponseAPI.forbidden(
            res,
            "Anda hanya dapat mengubah status menjadi On Progress."
          );
        }

        // Ubah status ke "On Progress"
        findCampaign.statusTransfer = "On Progress";

        if (accountNumber) {
          findCampaign.accountNumber = accountNumber;
        }
        if (bankName) {
          findCampaign.bankName = bankName;
        }
        await findCampaign.save();
        return ResponseAPI.success(res, findCampaign);
      }

      // Cek peran admin
      if (req.user.role === ROLES.ADMIN) {
        // Admin bebas mengubah status ke nilai valid lainnya
        if (!["On Request", "On Progress", "Success"].includes(newStatus)) {
          return next({
            name: errorName.VALIDATION_ERROR,
            message: errorMsg.INVALID_CAMPAIGN_STATUS,
          });
        }

        findCampaign.statusTransfer = newStatus;
        if (accountNumber) {
          findCampaign.accountNumber = accountNumber;
        }
        if (bankName) {
          findCampaign.bankName = bankName;
        }
        await findCampaign.save();

        return ResponseAPI.success(res, findCampaign);
      }

      // Jika bukan admin atau user yang valid
      return ResponseAPI.forbidden(
        res,
        "Anda tidak memiliki akses untuk mengubah status."
      );
    } catch (error) {
      next(error);
    }
  },

  async updateUrgentCampaign(req, res, next) {
    try {
      const { _id, newStatus } = req.params;
      if (req.user.role !== ROLES.ADMIN) {
        return ResponseAPI.forbidden(
          res,
          "Hanya admin yang dapat mengubah status urgent"
        );
      }

      const findCampaign = await Campaign.findOne({
        _id: _id,
        deletedAt: null,
      });
      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      if (!["true", "false"].includes(newStatus)) {
        return next({
          name: errorName.VALIDATION_ERROR,
          message: errorMsg.INVALID_URGENT_STATUS,
        });
      }
      // Update status
      findCampaign.isUrgent = newStatus;
      await findCampaign.save();
      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = campaignController;
