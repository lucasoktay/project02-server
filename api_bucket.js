const { ListObjectsV2Command, StorageClass } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

exports.get_bucket = async (req, res) => {
  console.log("**Call to get /bucket...");

  try {
    let input = {
      Bucket: s3_bucket_name,
      MaxKeys: 12
    };

    if (req.query.startafter) {
      input.StartAfter = req.query.startafter;
    }

    let command = new ListObjectsV2Command(input);
    let response = await photoapp_s3.send(command);
    let assets = response.Contents.map(item => ({
      Key: item.Key,
      LastModified: item.LastModified,
      ETag: item.ETag,
      Size: item.Size,
      StorageClass: item.StorageClass
    }));

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