import { S3 } from "aws-sdk";
import path from "path";
import fs from "fs";

const s3 = new S3({
  accessKeyId: "3b02dba3fb951ce288a2956ffa39b0a6",
  secretAccessKey:
    "43ba304317ed1c68bf2a069032cbebdc40cb4ace0998aca5d09e234f343af66f",
  endpoint: "https://195828be91cabc7d0dcd894837ad2329.r2.cloudflarestorage.com",
});

export async function downloadS3Folder(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "vercel",
      Prefix: prefix,
    })
    .promise();

  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: "vercel",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];

  await Promise.all(allPromises?.filter((x) => x != undefined));
}

export async function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach(file => {
    uploadFile(`dist/${id}/` + file.slice(folderPath.length+1), file);
  })
}

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach(file => {
      const fullFilePath = path.join(folderPath, file);
      if(fs.statSync(fullFilePath).isDirectory()) {
          response = response.concat(getAllFiles(fullFilePath))
      } else {
          response.push(fullFilePath);
      }
  })

  return response;
}

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