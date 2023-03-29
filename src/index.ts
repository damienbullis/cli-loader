import { exec } from "child_process";

exec("ls", (err, stdout, stderr) => {
  console.log(stdout);
});
