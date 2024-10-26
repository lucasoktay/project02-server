const photoapp_db = require('./photoapp_db.js');

function query_database(db, sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

exports.get_assets = async (req, res) => {
  console.log("**Call to get /assets...");

  try {
    const sql = 'SELECT * FROM assets ORDER BY assetid ASC';
    const assets = await query_database(photoapp_db, sql);

    res.json({
      "message": "success",
      "data": assets
    });
  } catch (err) {
    console.log("**Error in /assets");
    console.log(err.message);

    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }
};