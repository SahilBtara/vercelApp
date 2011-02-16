// id =3b02dba3fb951ce288a2956ffa39b0a6
// secret = 43ba304317ed1c68bf2a069032cbebdc40cb4ace0998aca5d09e234f343af66f
// endpoint = https://195828be91cabc7d0dcd894837ad2329.r2.cloudflarestorage.com
import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";

const publisher = createClient();
publisher.connect();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generate();
  console.log(repoUrl);
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });

  publisher.lPush("build-queue", id);

  res.json({
    id: id,
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
