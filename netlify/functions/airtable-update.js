// netlify/functions/airtable-update.js
const Airtable = require('airtable');

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  // Allow only POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // CORS preflight (just in case)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // tighten later if you want
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const payload = JSON.parse(event.body || '{}');
    const { action, table, fields, recordId, filterByFormula, maxRecords = 1 } = payload;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing Airtable env vars' }) };
    }
    if (!table || !action) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing table or action' }) };
    }

    if (action === 'create') {
      if (!fields) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
      const created = await base(table).create([{ fields }]);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, records: created }) };
    }

    if (action === 'update') {
      if (!recordId || !fields) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing recordId or fields' }) };
      }
      const updated = await base(table).update([{ id: recordId, fields }]);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, records: updated }) };
    }

    if (action === 'select') {
      const page = await base(table)
        .select({ filterByFormula: filterByFormula || '', maxRecords })
        .firstPage();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, records: page }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', details: String(err) }),
    };
  }
};