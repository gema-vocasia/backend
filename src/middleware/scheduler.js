const cron = require("node-cron");
const Campaign = require("../models/Campaign"); // Sesuaikan path model Campaign

// Fungsi untuk memperbarui status kampanye
const updateCampaignStatus = async () => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      statusCampaign: "On Going",
      endDate: { $lte: now },
      deletedAt: null,
    });

    // Perbarui status setiap kampanye
    for (let campaign of campaigns) {
      campaign.statusCampaign = "Done";
      await campaign.save();
      console.log(
        `Kampanye dengan ID ${campaign._id} telah diperbarui menjadi "Done"`
      );
    }
  } catch (error) {
    console.error("Gagal memperbarui status kampanye:", error.message);
  }
};

// Fungsi utama untuk menjalankan scheduler
const startScheduler = () => {
  cron.schedule("* * * * *", () => {
    // Pengecekan setiap menit
    updateCampaignStatus();
  });
};

module.exports = startScheduler; // Pastikan fungsi diexport dengan benar
