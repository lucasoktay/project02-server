const photoapp_db = require('./photoapp_db.js');

exports.put_user = async (req, res) => {
  console.log("**Call to put /user...");

  try {
    let data = req;
    console.log("**Received data:", data);

    let sql = `SELECT userid FROM users WHERE email = ?`;
    let results = await query_database(photoapp_db, sql, [data.email]);
    console.log("**Query results:", results);

    if (results.length > 0) {
      let userid = results[0].userid;
      sql = `UPDATE users SET firstname = ?, lastname = ?, bucketfolder = ? WHERE userid = ?`;
      let updateResult = await query_database(photoapp_db, sql, [data.firstname, data.lastname, data.bucketfolder, userid]);
      console.log("**Update result:", updateResult);

      if (updateResult.affectedRows == 1) {
        res.json({
          "message": "updated",
          "userid": userid
        });
      } else {
        throw new Error("Failed to update user");
      }
    } else {
      sql = `INSERT INTO users (email, firstname, lastname, bucketfolder) VALUES (?, ?, ?, ?)`;
      let insertResult = await query_database(photoapp_db, sql, [data.email, data.firstname, data.lastname, data.bucketfolder]);
      console.log("**Insert result:", insertResult);

      if (insertResult.affectedRows == 1) {
        res.json({
          "message": "inserted",
          "userid": insertResult.insertId
        });
      } else {
        throw new Error("Failed to insert user");
      }
    }
  } catch (err) {
    console.log("**Error in /user");
    console.log(err.message);

    res.status(500).json({
      "message": data,
      "userid": -1
    });
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