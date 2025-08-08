exports.handler = async function(event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Netlify function is working!",
      apiKeyPresent: !!apiKey,
      baseIdPresent: !!baseId
    }),
  };
};