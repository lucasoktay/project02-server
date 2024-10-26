const photoapp_db = require('./photoapp_db.js')
const { HeadBucketCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

function query_database(db, sql) {
  let response = new Promise((resolve, reject) => {
    try {
      db.query(sql, (err, results, _) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(results);
        }
      });
    }
    catch (err) {
      reject(err);
    }
  });

  return response;
}

exports.get_stats = async (req, res) => {

  console.log("**Call to get /stats...");

  try {
    let input = {
      Bucket: s3_bucket_name
    };

    console.log("/stats: calling S3...");

    let command = new HeadBucketCommand(input);
    let s3_promise = photoapp_s3.send(command);

    let sql = `
        Select count(*) As NumUsers From users;
        `;

    console.log("/stats: calling RDS to get # of users...");

    let mysql_promise1 = query_database(photoapp_db, sql);

    sql = `
        Select count(*) As NumAssets From assets;
        `;

    console.log("/stats: calling RDS to get # of assets...");

    let mysql_promise2 = query_database(photoapp_db, sql);

    let results = await Promise.all([s3_promise, mysql_promise1, mysql_promise2]);

    let s3_results = results[0];
    let metadata = s3_results["$metadata"];
    let rds_user_results = results[1];
    let user_row = rds_user_results[0];
    let rds_asset_results = results[2];
    let asset_row = rds_asset_results[0];

    console.log("/stats done, sending response...");

    res.json({
      "message": "success",
      "s3_status": metadata["httpStatusCode"],
      "db_numUsers": user_row["NumUsers"],
      "db_numAssets": asset_row["NumAssets"]
    });
  }
  catch (err) {
    console.log("**Error in /stats");
    console.log(err.message);

    res.status(500).json({
      "message": err.message,
      "s3_status": -1,
      "db_numUsers": -1,
      "db_numAssets": -1
    });
  }

}
