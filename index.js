const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const app = require("./app");
const config = require("./utils/config");
//const port = 3000;

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
