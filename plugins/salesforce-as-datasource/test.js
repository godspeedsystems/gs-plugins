var jsforce = require("jsforce");

const username = "sahilmandal-vcv8@force.com";
const password = "sahil@123";
const security_token = "WRd94ol16cT33n7D3d1uujCGD";
const loginUrl = "https://login.salesforce.com";

const initClient = () => {
  return new Promise((resolve, reject) => {
    const conn = new jsforce.Connection({
      loginUrl: loginUrl,
    });

    conn.login(username, password + security_token, (err, userInfo) => {
      if (err) {
        reject(err); // Reject the Promise if there's an error
      } else {
        console.log("Connection Established");
        resolve(conn); // Resolve the Promise with the conn object
      }
    });
  });
};

(async () => {
  try {
    const conn = await initClient();
    // console.log(conn.sobject("Account")["create"]({ Name: "My Account #1" }));
    console.log(
      await conn.sobject("Account").retrieve({ Id: "0015j00001CkzV9AAJ" })
    );
    // console.log(await conn["query"]("SELECT Id, Name FROM Account"));
  } catch (err) {
    console.error(err);
  }
})();
Id: "0015j00001CkzV9AAJ";
// conn.sobject("Account").create({ Name: "My Account #1" }, function (err, ret) {
//   if (err || !ret.success) {
//     return console.error(err, ret);
//   }
//   console.log("Created record id : " + ret.id);
// });

// conn.sobject("Account").retrieve("0017000000hOMChAAO", function (err, account) {
//   if (err) {
//     return console.error(err);
//   }
//   console.log("Name : " + account.Name);
// });

// conn.sobject("Account").update(
//   {
//     Id: "0017000000hOMChAAO",
//     Name: "Updated Account #1",
//   },
//   function (err, ret) {
//     if (err || !ret.success) {
//       return console.error(err, ret);
//     }
//     console.log("Updated Successfully : " + ret.id);
//   }
// );

// conn.sobject("Account").destroy("0017000000hOMChAAO", function (err, ret) {
//   if (err || !ret.success) {
//     return console.error(err, ret);
//   }
//   console.log("Deleted Successfully : " + ret.id);
// });

// conn.query("SELECT Id, Name FROM Account", function (err, result) {
//   if (err) {
//     return console.error(err);
//   }
//   console.log("total : " + result.totalSize);
//   console.log("fetched : " + result.records.length);
// });
