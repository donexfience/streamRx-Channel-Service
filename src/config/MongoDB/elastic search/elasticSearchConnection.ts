import { Client } from "@elastic/elasticsearch";

console.log(
  process.env.ELASTIC_USER_NAME,
  "user name",
  process.env.ELASTIC_PASSWORD,
  "password got",
  process.env.ELASTIC
);
const client = new Client({
  node: process.env.ELASTIC,
  auth: {
    username: process.env.ELASTIC_USER_NAME || "donex",
    password: process.env.ELASTIC_PASSWORD || "your_password",
  },
  
});
client
  .ping()
  .then(() => console.log("Connected to Elasticsearch!"))
  .catch((err: any) =>
    console.error("Could not connect to Elasticsearch:", err)
  );

export default client;
