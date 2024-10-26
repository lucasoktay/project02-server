const photoapp_db = require('./photoapp_db.js');

exports.put_user = async (req, res) => {
  console.log("**Call to put /user...");

  try {
    let data = req.body;

    let sql = `SELECT userid FROM users WHERE email = ?`;
    let results = await query_database(photoapp_db, sql, [data.email]);

    if (results.length > 0) {
      let userid = results[0].userid;
      sql = `UPDATE users SET firstname = ?, lastname = ?, bucketfolder = ? WHERE userid = ?`;
      let updateResult = await query_database(photoapp_db, sql, [data.firstname, data.lastname, data.bucketfolder, userid]);

      if (updateResult.affectedRows == 1) {
        res.json({
          "message": "updated",
          "userid": userid,
        });
      } else {
        res.status(500).json({ error: "Failed to update user" });
      }
    } else {
      // Insert new user if not found
      sql = `INSERT INTO users (email, firstname, lastname, bucketfolder) VALUES (?, ?, ?, ?)`;
      let insertResult = await query_database(photoapp_db, sql, [data.email, data.firstname, data.lastname, data.bucketfolder]);

      if (insertResult.affectedRows == 1) {
        res.json({
          "message": "inserted",
          "userid": insertResult.insertId,
        });
      } else {
        res.status(500).json({ error: "Failed to insert user" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

function query_database(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function query_database(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}