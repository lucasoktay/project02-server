const photoapp_db = require('./photoapp_db.js');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');
const uuid = require('uuid');

exports.post_image = async (req, res) => {
  console.log("**Call to post /image/:userid...");

  try {
    let userid = req.params.userid;
    let data = req.body;

    let sql = `SELECT bucketfolder FROM users WHERE userid = ?`;
    let results = await query_database(photoapp_db, sql, [userid]);

    if (results.length === 0) {
      res.status(400).json({
        "message": "no such user...",
        "assetid": -1
      });
      return;
    }

    let bucketfolder = results[0].bucketfolder;
    let bytes = Buffer.from(data.data, 'base64');
    let name = uuid.v4();
    let key = `${bucketfolder}/${name}.jpg`;

    let input = {
      Bucket: s3_bucket_name,
      Key: key,
      Body: bytes,
      ContentType: "image/jpg",
      ACL: "public-read"
    };

    let command = new PutObjectCommand(input);
    await photoapp_s3.send(command);

    sql = `INSERT INTO assets (userid, assetname, bucketkey) VALUES (?, ?, ?)`;
    let insertResult = await query_database(photoapp_db, sql, [userid, data.assetname, key]);

    if (insertResult.affectedRows == 1) {
      res.json({
        "message": "success",
        "assetid": insertResult.insertId
      });
    } else {
      throw new Error("Failed to insert asset");
    }
  } catch (err) {
    console.log("**Error in /image");
    console.log(err.message);

    res.status(400).json({
      "message": err.message,
      "assetid": -1
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