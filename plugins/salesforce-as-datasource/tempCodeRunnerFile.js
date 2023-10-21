var jsforce = require("jsforce");

const initClient = () => {
  username = "sahilmandal-vcv8@force.com";
  password = "sahil@123";
  scurity_token = "WRd94ol16cT33n7D3d1uujCGD";
  loginUrl = "https://login.salesforce.com";
  var conn = new jsforce.Connection({
    loginUrl: loginUrl,
    // oauth2: {
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl: loginUrl,
    // clientId: "<your Salesforce OAuth2 client ID is here>",
    // clientSecret: "<your Salesforce OAuth2 client secret is here>",
    // redirectUri: "<callback URI is here>",
    // },
  });
  conn.login(username, password + scurity_token, function (err, userInfo) {
    if (err) {
      return console.error(err);
    } else {
      return console.log("Connection Established");
    }
  });
  return conn;
};
const conn = initClient();

conn.sobject("Account").create({ Name: "My Account #1" }, function (err, ret) {
  if (err || !ret.success) {
    return console.error(err, ret);
  }
  console.log("Created record id : " + ret.id);
});