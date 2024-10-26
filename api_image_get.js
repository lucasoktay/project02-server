const photoapp_db = require('./photoapp_db.js');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name } = require('./photoapp_s3.js');


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

exports.get_image = async (req, res) => {
  console.log("**Call to get /image/:assetid...");

  try {
    const assetid = req.params.assetid;
    const sql = 'SELECT userid, assetname, bucketkey FROM assets WHERE assetid = ?';
    const results = await query_database(photoapp_db, sql, [assetid]);

    if (results.length === 0) {
      res.status(400).json({
        "message": "no such asset...",
        "data": []
      });
      return;
    }

    const { userid, assetname, bucketkey } = results[0];
    const input = {
      Bucket: s3_bucket_name,
      Key: bucketkey
    };

    const command = new GetObjectCommand(input);
    const response = await photoapp_s3.send(command);
    const datastr = await response.Body.transformToString("base64");

    res.json({
      "message": "success",
      "user_id": userid,
      "asset_name": assetname,
      "bucket_key": bucketkey,
      "data": datastr
    });
  } catch (err) {
    console.log("**Error in /image/:assetid");
    console.log(err.message);

    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }
};