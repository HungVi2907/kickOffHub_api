exports.fetchAndStoreCountries = async (req, res) => {
  try {
    console.log('Controller called');
    const apiData = await apiHelper.getCountries();
    const apiCountries = apiData.response; //Lấy đúng mảng dữ liệu

    console.log('Total countries:', apiCountries.length);

    for (const apiCountry of apiCountries) {
      const country = dataMapper.mapCountryData(apiCountry);
      console.log('Mapped country:', country);

      await db.query(
        'INSERT INTO countries (name, code, flag_url) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), flag_url=VALUES(flag_url)',
        [country.name, country.code, country.flag_url]
      );
    }

    res.json({ message: 'Cập nhật danh sách quốc gia thành công.' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};
const apiHelper = require('../helpers/apiHelper');
const dataMapper = require('../helpers/dataMapper');
const db = require('../config/db');