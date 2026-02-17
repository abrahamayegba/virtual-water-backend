import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../lib/s3";

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: "virtualwaterelearning", // 👈 REQUIRED
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, `lessons/${filename}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
