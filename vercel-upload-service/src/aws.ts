// id =3b02dba3fb951ce288a2956ffa39b0a6
// secret = 43ba304317ed1c68bf2a069032cbebdc40cb4ace0998aca5d09e234f343af66f
// endpoint = https://195828be91cabc7d0dcd894837ad2329.r2.cloudflarestorage.com
import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
  accessKeyId: "3b02dba3fb951ce288a2956ffa39b0a6",
  secretAccessKey:
    "43ba304317ed1c68bf2a069032cbebdc40cb4ace0998aca5d09e234f343af66f",
  endpoint: "https://195828be91cabc7d0dcd894837ad2329.r2.cloudflarestorage.com",
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log("called");
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel",
      Key: fileName,
    })
    .promise();
  console.log(response);
};
