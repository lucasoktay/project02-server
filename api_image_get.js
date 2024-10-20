//
// app.get('/image/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
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

    // Retrieve the asset's details from the database
    const sql = 'SELECT userid, assetname, bucketkey FROM assets WHERE assetid = ?';
    const results = await query_database(photoapp_db, sql, [assetid]);

    if (results.length === 0) {
      res.status(400).json({
        "message": "Invalid assetid",
        "data": []
      });
      return;
    }

    const { userid, assetname, bucketkey } = results[0];

    // Set up the input object for the GetObjectCommand
    const input = {
      Bucket: s3_bucket_name,
      Key: bucketkey
    };

    // Create the command
    const command = new GetObjectCommand(input);

    // Send the command to S3
    const response = await photoapp_s3.send(command);

    // Transform the Body of the result into a base64-encoded string
    const datastr = await response.Body.transformToString("base64");

    // Return the response with the required fields
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