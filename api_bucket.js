//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
const { ListObjectsV2Command, StorageClass } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

exports.get_bucket = async (req, res) => {
  console.log("**Call to get /bucket...");

  try {
    // Set up the input object for the ListObjectsV2Command
    let input = {
      Bucket: s3_bucket_name,
      MaxKeys: 12
    };

    // Check for the startafter query parameter
    if (req.query.startafter) {
      input.StartAfter = req.query.startafter;
    }

    // Create the command
    let command = new ListObjectsV2Command(input);

    // Send the command to S3
    let response = await photoapp_s3.send(command);

    // Extract the relevant data from the response
    let assets = response.Contents.map(item => ({
      Key: item.Key,
      LastModified: item.LastModified,
      ETag: item.ETag,
      Size: item.Size,
      StorageClass: item.StorageClass
    }));

    // Return the results to the client
    res.json({
      "message": "success",
      "data": assets,
      "isTruncated": response.IsTruncated,
      "nextStartAfter": response.NextContinuationToken,
      "keyCount": response.KeyCount
    });
  } catch (err) {
    console.log("**Error in /bucket");
    console.log(err.message);

    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }
};