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

exports.get_users = async (req, res) => {
  console.log("**Call to get /users...");

  try {
    const sql = 'SELECT * FROM users';
    const users = await query_database(photoapp_db, sql);

    res.json({
      "message": "success",
      "data": users
    });
  } catch (err) {
    console.log("**Error in /users");
    console.log(err.message);

    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }
};