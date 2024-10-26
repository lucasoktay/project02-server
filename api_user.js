const photoapp_db = require('./photoapp_db.js');

exports.put_user = async (req, res) => {
  console.log("**Call to put /user...");

  try {
    let data = req.body;
    console.log("**Received data:", data);

    // Basic validation
    if (!data.email || !data.firstname || !data.lastname || !data.bucketfolder) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (typeof data.email !== 'string' || !data.email.includes('@')) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (typeof data.firstname !== 'string' || data.firstname.length < 1 || data.firstname.length > 100) {
      return res.status(400).json({ error: "Invalid firstname" });
    }

    if (typeof data.lastname !== 'string' || data.lastname.length < 1 || data.lastname.length > 100) {
      return res.status(400).json({ error: "Invalid lastname" });
    }

    if (typeof data.bucketfolder !== 'string' || data.bucketfolder.length < 1 || data.bucketfolder.length > 255) {
      return res.status(400).json({ error: "Invalid bucketfolder" });
    }

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
          "userid": userid,
        });
      } else {
        res.status(500).json({ error: "Failed to update user" });
      }
    } else {
      // Insert new user if not found
      sql = `INSERT INTO users (email, firstname, lastname, bucketfolder) VALUES (?, ?, ?, ?)`;
      let insertResult = await query_database(photoapp_db, sql, [data.email, data.firstname, data.lastname, data.bucketfolder]);
      console.log("**Insert result:", insertResult);

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