// Importing the MongoClient class from the mongodb package
const { MongoClient } = require("mongodb");
const querystring = require('querystring');

// Defining the serverless function
exports.handler = async function (event) {
  // Creating a new MongoClient instance with the MongoDB URL from the environment variables
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    // Connecting to the MongoDB server
    await client.connect();
    // Accessing the "mydatabase" database
    const db = client.db("figpindb");
    // Accessing the "items" collection
    const collection = db.collection("pins");

    // Handling GET requests
    if (event.httpMethod === "GET") {
      // Fetching all items from the collection and converting the result to an array
        let query = { };
          if (event.queryStringParameters.category) {
    query = { "category": event.queryStringParameters.category }
  } else if (event.queryStringParameters.property) {
    query = { "property": event.queryStringParameters.property }
  } else if (event.queryStringParameters.pin_name) {
    query = { $text: { $search: event.queryStringParameters.pin_name } }
  } else if (event.queryStringParameters.company) {
    query = { "company": { $regex : event.queryStringParameters.company } }
  } else if (event.queryStringParameters.year) {
    query = { "year": { $regex : event.queryStringParameters.year } }
  } else if (event.queryStringParameters.tags) {
    query = { "tags": { $regex : event.queryStringParameters.tags } }
  } else if (event.queryStringParameters.type) {
    query = { "type": { $regex : event.queryStringParameters.type } }
  } else if (event.queryStringParameters.set) {
    query = { "set": event.queryStringParameters.set  }
  }
  
      const data = await collection.find(query, { pin_id: 1, pin_name: 1, category: 1, set: 1, main_img: 1, _id: 0}).sort({"pin_id": -1}).toArray();
      // Returning a 200 status code and the fetched data
      return {
        statusCode: 200,
        headers: {
        /* Required for CORS support to work */
        'Access-Control-Allow-Origin': '*',
        /* Required for cookies, authorization headers with HTTPS */
        'Access-Control-Allow-Credentials': true
      },
        body: JSON.stringify(data)
      };
    }

    // Handling other HTTP methods
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  } catch (error) {
    // Handling any errors that occur during the execution of the function
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    // Closing the MongoDB client connection
    await client.close();
  }
};