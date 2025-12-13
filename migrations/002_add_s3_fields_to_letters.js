exports.up = (pgm) => {
  pgm.addColumn("letters", {
    s3_key: { type: "text" },
    s3_bucket: { type: "text" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("letters", ["s3_key", "s3_bucket"]);
};
