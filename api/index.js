const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are SmartTripPlanner AI, a travel destination recommendation expert.

Your ONLY job is helping users discover WHERE to travel. You specialize in destination discovery.

STRICT RULES:
- You do NOT generate itineraries or day-by-day travel plans.
- You do NOT act as a booking assistant.
- You recommend destinations and encourage users to generate detailed itineraries at https://smarttripplannerai.netlify.app
- Keep responses concise, friendly, and useful.
- Always respond with valid JSON only, no markdown fences.`;

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: 'application/json' }
  });
}

async function callGemini(prompt) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

const SUMMER_MONTHS = ['April', 'May', 'June'];
const MONSOON_MONTHS = ['July', 'August', 'September'];
const WINTER_MONTHS = ['November', 'December', 'January', 'February'];

function normalizeMonthName(month) {
  if (!month) return '';
  const m = month.trim();
  if (/flexible|any/i.test(m)) return '';
  const found = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    .find(mon => m.toLowerCase().startsWith(mon.toLowerCase().slice(0, 3)));
  return found || m;
}

function monthSeasonHint(month) {
  const m = normalizeMonthName(month);
  if (!m) return '';
  if (SUMMER_MONTHS.includes(m)) return 'Pleasant hills & escapes from heat';
  if (MONSOON_MONTHS.includes(m)) return 'Lush greenery & monsoon-friendly spots';
  if (WINTER_MONTHS.includes(m)) return 'Cool weather & winter charm';
  if (['March', 'October'].includes(m)) return 'Shoulder season — great weather';
  return 'Ideal travel season';
}

function applyMonthToRecommendations(data, month) {
  const m = normalizeMonthName(month);
  if (!m || !data.destinations) return data;
  const hint = monthSeasonHint(m);
  data.destinations = data.destinations.map(function (d) {
    return Object.assign({}, d, {
      bestTimeToVisit: 'Ideal in ' + m + ' — ' + hint
    });
  });
  return data;
}

function getMonthPool(region, category, month) {
  const m = normalizeMonthName(month);
  if (!m || /flexible|any/i.test(month)) return null;

  const indiaSummer = {
    Mountains: ['Manali', 'Shimla', 'Mussoorie', 'Darjeeling', 'Kasol'],
    Beaches: ['Andaman Islands', 'Gokarna', 'Varkala', 'Pondicherry', 'Lakshadweep'],
    Heritage: ['Udaipur', 'Hampi', 'Mahabalipuram', 'Khajuraho', 'Amritsar'],
    Adventure: ['Ladakh', 'Spiti Valley', 'Rishikesh', 'Meghalaya', 'Coorg'],
    Wildlife: ['Jim Corbett', 'Bandhavgarh', 'Kabini', 'Periyar', 'Kaziranga'],
    Spiritual: ['Rishikesh', 'Dharamshala', 'Amritsar', 'Bodh Gaya', 'Haridwar'],
    Luxury: ['Udaipur', 'Shimla', 'Munnar', 'Andaman Islands', 'Coorg'],
    Romantic: ['Munnar', 'Udaipur', 'Shimla', 'Coorg', 'Alleppey'],
    Family: ['Ooty', 'Munnar', 'Shimla', 'Mussoorie', 'Darjeeling']
  };
  const indiaMonsoon = {
    Mountains: ['Manali', 'Mussoorie', 'Munnar', 'Shillong', 'Lonavala'],
    Beaches: ['Gokarna', 'Varkala', 'Pondicherry', 'Andaman Islands', 'Daman'],
    Heritage: ['Udaipur', 'Hampi', 'Mahabalipuram', 'Khajuraho', 'Orchha'],
    Adventure: ['Ladakh', 'Meghalaya', 'Coorg', 'Rishikesh', 'Valparai'],
    Wildlife: ['Periyar', 'Kabini', 'Bandipur', 'Nagarhole', 'Jim Corbett'],
    Spiritual: ['Rishikesh', 'Haridwar', 'Amritsar', 'Dharamshala', 'Varanasi'],
    Luxury: ['Udaipur', 'Munnar', 'Coorg', 'Shillong', 'Kodaikanal'],
    Romantic: ['Munnar', 'Udaipur', 'Coorg', 'Shillong', 'Kodaikanal'],
    Family: ['Ooty', 'Munnar', 'Shillong', 'Mussoorie', 'Lonavala']
  };
  const indiaWinter = {
    Mountains: ['Manali', 'Shimla', 'Auli', 'Gulmarg', 'Darjeeling'],
    Beaches: ['Goa', 'Andaman Islands', 'Gokarna', 'Pondicherry', 'Varkala'],
    Heritage: ['Jaipur', 'Udaipur', 'Jaisalmer', 'Agra', 'Hampi'],
    Adventure: ['Rishikesh', 'Jaisalmer', 'Goa', 'Kutch', 'Spiti Valley'],
    Wildlife: ['Ranthambore', 'Jim Corbett', 'Kaziranga', 'Gir', 'Sundarbans'],
    Spiritual: ['Varanasi', 'Amritsar', 'Pushkar', 'Bodh Gaya', 'Tirupati'],
    Luxury: ['Goa', 'Udaipur', 'Jaipur', 'Andaman Islands', 'Kerala Backwaters'],
    Romantic: ['Udaipur', 'Goa', 'Jaipur', 'Shimla', 'Alleppey'],
    Family: ['Goa', 'Jaipur', 'Ooty', 'Andaman Islands', 'Darjeeling']
  };

  let indiaMap = indiaWinter;
  if (SUMMER_MONTHS.includes(m)) indiaMap = indiaSummer;
  else if (MONSOON_MONTHS.includes(m)) indiaMap = indiaMonsoon;

  const intlSummer = {
    Europe: ['Zurich, Switzerland', 'Interlaken, Switzerland', 'Reykjavik, Iceland', 'Oslo, Norway', 'Edinburgh, UK'],
    'Southeast Asia': ['Bali, Indonesia', 'Chiang Mai, Thailand', 'Hanoi, Vietnam', 'Cameron Highlands, Malaysia', 'Siem Reap, Cambodia'],
    'Middle East': ['Muscat, Oman', 'Amman, Jordan', 'Beirut, Lebanon', 'Tabuk, Saudi Arabia', 'Petra, Jordan'],
    'East Asia': ['Hokkaido, Japan', 'Seoul, South Korea', 'Taipei, Taiwan', 'Beijing, China', 'Hakone, Japan'],
    Australia: ['Sydney, Australia', 'Melbourne, Australia', 'Tasmania, Australia', 'Blue Mountains, Australia', 'Perth, Australia'],
    'USA & Canada': ['Banff, Canada', 'Vancouver, Canada', 'San Francisco, USA', 'Seattle, USA', 'Portland, USA'],
    Africa: ['Cape Town, South Africa', 'Marrakech, Morocco', 'Victoria Falls, Zimbabwe', 'Cairo, Egypt', 'Zanzibar, Tanzania'],
    'South America': ['Patagonia, Argentina', 'Santiago, Chile', 'Cusco, Peru', 'Medellín, Colombia', 'Quito, Ecuador']
  };
  const intlWinter = {
    Europe: ['Paris, France', 'Rome, Italy', 'Barcelona, Spain', 'Prague, Czechia', 'Vienna, Austria'],
    'Southeast Asia': ['Phuket, Thailand', 'Bali, Indonesia', 'Singapore', 'Langkawi, Malaysia', 'Palawan, Philippines'],
    'Middle East': ['Dubai, UAE', 'Abu Dhabi, UAE', 'Doha, Qatar', 'Muscat, Oman', 'Tel Aviv, Israel'],
    'East Asia': ['Tokyo, Japan', 'Kyoto, Japan', 'Seoul, South Korea', 'Hong Kong', 'Taipei, Taiwan'],
    Australia: ['Gold Coast, Australia', 'Great Barrier Reef, Australia', 'Sydney, Australia', 'Whitsundays, Australia', 'Byron Bay, Australia'],
    'USA & Canada': ['Miami, USA', 'Los Angeles, USA', 'Cancún, Mexico', 'Phoenix, USA', 'Honolulu, Hawaii'],
    Africa: ['Mauritius', 'Maldives', 'Seychelles', 'Cape Town, South Africa', 'Marrakech, Morocco'],
    'South America': ['Rio de Janeiro, Brazil', 'Cartagena, Colombia', 'Buenos Aires, Argentina', 'Galápagos, Ecuador', 'Punta del Este, Uruguay']
  };

  const map = region === 'Within India' ? indiaMap : intlWinter;
  return (map[category] || map.Mountains || map.Europe).slice();
}

function getFallbackRecommendations(prefs) {
  const { region, month, category, budget, duration, travelStyle } = prefs;
  let pool = getMonthPool(region, category, month);
  if (!pool || pool.length < 3) {
    const india = {
      Beaches: ['Goa', 'Andaman Islands', 'Gokarna', 'Pondicherry', 'Varkala'],
      Mountains: ['Manali', 'Shimla', 'Mussoorie', 'Darjeeling', 'Kasol'],
      Heritage: ['Udaipur', 'Hampi', 'Khajuraho', 'Agra', 'Jaipur'],
      Adventure: ['Rishikesh', 'Ladakh', 'Spiti Valley', 'Meghalaya', 'Coorg'],
      Wildlife: ['Ranthambore', 'Jim Corbett', 'Kaziranga', 'Bandhavgarh', 'Sundarbans'],
      Spiritual: ['Varanasi', 'Rishikesh', 'Amritsar', 'Bodh Gaya', 'Tirupati'],
      Luxury: ['Udaipur', 'Kerala Backwaters', 'Goa', 'Jaipur', 'Andaman Islands'],
      Romantic: ['Udaipur', 'Munnar', 'Goa', 'Shimla', 'Alleppey'],
      Family: ['Goa', 'Ooty', 'Jaipur', 'Munnar', 'Darjeeling']
    };
    const intl = {
      Europe: ['Paris, France', 'Rome, Italy', 'Barcelona, Spain', 'Prague, Czechia', 'Amsterdam, Netherlands'],
      'Southeast Asia': ['Bali, Indonesia', 'Bangkok, Thailand', 'Hanoi, Vietnam', 'Singapore', 'Phuket, Thailand'],
      'Middle East': ['Dubai, UAE', 'Abu Dhabi, UAE', 'Doha, Qatar', 'Muscat, Oman', 'Petra, Jordan'],
      'East Asia': ['Tokyo, Japan', 'Seoul, South Korea', 'Kyoto, Japan', 'Taipei, Taiwan', 'Hong Kong'],
      Australia: ['Sydney, Australia', 'Melbourne, Australia', 'Gold Coast, Australia', 'Cairns, Australia', 'Perth, Australia'],
      'USA & Canada': ['New York, USA', 'San Francisco, USA', 'Vancouver, Canada', 'Las Vegas, USA', 'Toronto, Canada'],
      Africa: ['Cape Town, South Africa', 'Marrakech, Morocco', 'Nairobi, Kenya', 'Zanzibar, Tanzania', 'Cairo, Egypt'],
      'South America': ['Rio de Janeiro, Brazil', 'Buenos Aires, Argentina', 'Lima, Peru', 'Cartagena, Colombia', 'Santiago, Chile']
    };
    pool = region === 'Within India' ? (india[category] || india.Beaches) : (intl[category] || intl.Europe);
  }
  const m = normalizeMonthName(month);
  const hint = monthSeasonHint(month);
  const monthNote = m ? ' in ' + m : '';
  const destinations = pool.slice(0, 5).map(function (name, i) {
    return {
      name: name,
      matchScore: 92 - i * 2,
      whyItMatches: name + ' shines' + monthNote + ' — ' + hint.toLowerCase() + '. Perfect for your ' + travelStyle.toLowerCase() + ' ' + category.toLowerCase() + ' trip within ' + budget + '.',
      budgetRange: budget,
      bestTimeToVisit: m ? 'Ideal in ' + m + ' — ' + hint : (region === 'Within India' ? 'Varies by season' : 'Check local season'),
      topHighlights: [m ? ('Great choice for ' + m) : 'Season-perfect visit', 'Local culture & cuisine', category + ' experiences'],
      idealTripLength: duration
    };
  });
  return {
    message: 'Here are 5 season-smart destinations' + monthNote + ' for your ' + travelStyle.toLowerCase() + ' ' + category.toLowerCase() + ' trip!',
    destinations: destinations
  };
}

function buildExtendedPool(region, category, month) {
  const primary = getMonthPool(region, category, month) || [];
  const summer = getMonthPool(region, category, 'May') || [];
  const monsoon = getMonthPool(region, category, 'July') || [];
  const winter = getMonthPool(region, category, 'December') || [];
  const merged = primary.concat(summer, monsoon, winter);
  const seen = new Set();
  return merged.filter(function (n) {
    const k = n.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function isExcluded(name, excludeNames) {
  const n = name.toLowerCase();
  return (excludeNames || []).some(function (e) {
    const x = e.toLowerCase();
    return n.includes(x) || x.includes(n);
  });
}

function getFollowupFallback(context, type) {
  const { region, month, category, budget, duration, travelStyle, batchIndex } = context;
  const exclude = (context.excludeNames || context.destinations || []).map(function (d) {
    return typeof d === 'string' ? d : d.name;
  });
  const pool = buildExtendedPool(region, category, month);
  let available = pool.filter(function (n) { return !isExcluded(n, exclude); });

  if (available.length < 3) {
    const extra = buildExtendedPool(region, category, 'Flexible');
    extra.forEach(function (n) {
      if (!isExcluded(n, exclude) && !available.includes(n)) available.push(n);
    });
  }

  const count = type === 'others' ? 5 : 3;
  const start = ((batchIndex || 1) - 1) * count;
  const slice = available.slice(start, start + count);
  if (!slice.length) {
    return { message: 'You\'ve explored all matching destinations for your preferences! Try adjusting month or category in a new chat.', destinations: [] };
  }

  const m = normalizeMonthName(month);
  const hint = monthSeasonHint(month);
  const labels = {
    similar: 'Similar vibes, fresh destinations',
    cheaper: 'Budget-friendly alternatives',
    luxury: 'Premium upgrade picks',
    hidden: 'Hidden gems off the beaten path',
    others: 'More options based on your preferences'
  };

  const destinations = slice.map(function (name, i) {
    return {
      name: name,
      matchScore: 88 - i * 2,
      whyItMatches: name + ' — ' + (labels[type] || 'Another great match') + (m ? ' for ' + m : '') + '. Fits your ' + travelStyle.toLowerCase() + ' ' + category.toLowerCase() + ' trip.',
      budgetRange: budget,
      bestTimeToVisit: m ? 'Ideal in ' + m + ' — ' + hint : 'Season varies',
      topHighlights: ['New pick for you', category + ' experiences', 'Worth exploring'],
      idealTripLength: duration
    };
  });

  return {
    message: 'Here are ' + slice.length + ' new destination' + (slice.length > 1 ? 's' : '') + ' — different from what you saw before!',
    destinations: destinations
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SmartTripPlanner Destination Widget' });
});

app.post('/api/recommend', async (req, res) => {
  try {
    const { region, month, category, budget, duration, travelStyle } = req.body;
    if (!region || !month || !category || !budget || !duration || !travelStyle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `Based on these traveler preferences, recommend exactly 5 destinations.

Preferences:
- Region: ${region}
- Travel Month: ${month}
- Interest/Category: ${category}
- Budget: ${budget}
- Trip Duration: ${duration}
- Travel Style: ${travelStyle}

Return JSON in this exact structure:
{
  "message": "A brief friendly intro message (1-2 sentences)",
  "destinations": [
    {
      "name": "Destination Name",
      "matchScore": 95,
      "whyItMatches": "2-3 sentences explaining why this fits their preferences",
      "budgetRange": "₹XX,XXX – ₹XX,XXX",
      "bestTimeToVisit": "Why ${month} is ideal (NOT the destination's general peak season)",
      "topHighlights": ["highlight1", "highlight2", "highlight3"],
      "idealTripLength": "X days"
    }
  ]
}

Rules:
- matchScore must be 70-99 (integer)
- Provide realistic budget ranges in INR matching their budget tier
- Destinations must match the region (${region}) and category (${category})
- CRITICAL: Only suggest destinations ideal to visit in ${month}. Avoid places with extreme heat, heavy monsoon, snow-blocked roads, or off-season closures during ${month} (e.g. no Rajasthan desert in May, no Ladakh in deep winter, no Goa beaches in peak monsoon)
- bestTimeToVisit MUST explain why ${month} specifically works (e.g. "Ideal in July — lush monsoon hills"). NEVER use generic "October – March" unless the user chose Flexible month
- Explain in whyItMatches why ${month} is a great time for each destination
- Do NOT include itinerary or day-by-day plans`;

    try {
      const data = applyMonthToRecommendations(await callGemini(prompt), month);
      res.json(data);
    } catch (aiErr) {
      console.warn('Gemini unavailable, using fallback:', aiErr.message);
      res.json(getFallbackRecommendations({ region, month, category, budget, duration, travelStyle }));
    }
  } catch (err) {
    console.error('Recommend error:', err);
    if (err.message === 'GEMINI_API_KEY is not configured') {
      return res.status(503).json({ error: 'AI service not configured. Add GEMINI_API_KEY to .env.local and restart the server.' });
    }
    res.status(500).json({ error: 'Failed to generate recommendations. Please try again.' });
  }
});

app.post('/api/followup', async (req, res) => {
  try {
    const { type, context, question } = req.body;
    if (!type || !context) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const excludeList = (context.excludeNames || (context.destinations || []).map(d => d.name)).join(', ');

    const typePrompts = {
      similar: 'Suggest exactly 3 NEW destinations similar in vibe to previous picks but NOT in the exclude list',
      cheaper: 'Suggest exactly 3 NEW cheaper alternative destinations NOT in the exclude list',
      luxury: 'Suggest exactly 3 NEW luxury upgrade destinations NOT in the exclude list',
      hidden: 'Suggest exactly 3 NEW hidden gem destinations NOT in the exclude list',
      others: 'Suggest exactly 5 completely DIFFERENT destinations matching their preferences, NOT in the exclude list',
      bestTime: 'Provide detailed best time to visit advice for their travel month and recommended destinations',
      visa: 'Provide visa information relevant to their chosen region and destinations (for Indians)',
      tips: 'Provide 5-7 practical travel tips for their destination type, travel month, and travel style',
      ask: 'Answer the traveler\'s custom question clearly and helpfully based on their session context'
    };

    const instruction = typePrompts[type];
    if (!instruction) {
      return res.status(400).json({ error: 'Invalid follow-up type' });
    }

    const destCount = ['others'].includes(type) ? 5 : (['bestTime', 'visa', 'tips', 'ask'].includes(type) ? 0 : 3);
    const askLine = type === 'ask' && question ? `\nTraveler's question: ${question}` : '';

    const prompt = `Context from user session:
- Region: ${context.region}
- Travel Month: ${context.month || 'Not specified'}
- Category: ${context.category}
- Budget: ${context.budget}
- Duration: ${context.duration}
- Travel Style: ${context.travelStyle}
- ALREADY SHOWN (do NOT repeat): ${excludeList || 'none'}
${askLine}

Task: ${instruction}

Return JSON:
{
  "message": "Friendly response (2-4 sentences)",
  "destinations": [
    {
      "name": "Destination Name",
      "matchScore": 85,
      "whyItMatches": "Why recommended",
      "budgetRange": "₹XX,XXX – ₹XX,XXX",
      "bestTimeToVisit": "Why ${context.month || 'this season'} works",
      "topHighlights": ["h1", "h2", "h3"],
      "idealTripLength": "X days"
    }
  ]
}

Rules:
- NEVER repeat destinations from the exclude list
- For ${type}, return exactly ${destCount || '0'} destinations in the array (${destCount ? 'required' : 'use empty [] for text-only answers'})
- Do NOT generate itineraries.`;

    try {
      let data = await callGemini(prompt);
      if (data.destinations && data.destinations.length) {
        data.destinations = data.destinations.filter(d =>
          !isExcluded(d.name, (context.excludeNames || []).concat((context.destinations || []).map(x => x.name)))
        );
      }
      if (destCount > 0 && (!data.destinations || !data.destinations.length)) {
        throw new Error('No new destinations from AI');
      }
      data = applyMonthToRecommendations(data, context.month);
      res.json(data);
    } catch (aiErr) {
      console.warn('Gemini followup fallback:', aiErr.message);
      if (['bestTime', 'visa', 'tips'].includes(type)) {
        const m = normalizeMonthName(context.month);
        const msgs = {
          bestTime: m
            ? 'For ' + m + ': ' + monthSeasonHint(m) + '. All recommended destinations are picked specifically for this month.'
            : 'Pick a travel month for season-specific advice.',
          visa: 'For international travel, check visa requirements on the official embassy website. Many Southeast Asian countries offer visa-on-arrival for Indian passport holders.',
          tips: 'Book flights early, pack for the season, try local cuisine, and keep digital copies of documents. Use our itinerary planner for a detailed plan!'
        };
        res.json({ message: msgs[type], destinations: [] });
      } else if (type === 'ask') {
        res.json({
          message: question
            ? 'Based on your ' + context.category + ' trip in ' + (context.month || 'your chosen month') + ': ' + question + ' — I\'d recommend checking weather for your specific destination and packing accordingly. Use "See Other Locations" for more destination ideas!'
            : 'Please ask a specific question about destinations, weather, budget, or travel tips.',
          destinations: []
        });
      } else {
        res.json(getFollowupFallback(context, type));
      }
    }
  } catch (err) {
    console.error('Followup error:', err);
    res.status(500).json({ error: 'Failed to process follow-up. Please try again.' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const lead = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      preferences: preferences || {},
      createdAt: new Date().toISOString()
    };

    console.log('[LEAD CAPTURED]', JSON.stringify(lead));

    try {
      const leadsDir = path.join(process.cwd(), 'data');
      const leadsFile = path.join(leadsDir, 'leads.json');
      if (!fs.existsSync(leadsDir)) fs.mkdirSync(leadsDir, { recursive: true });
      let leads = [];
      if (fs.existsSync(leadsFile)) {
        leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
      }
      leads.push(lead);
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
    } catch {
      // Vercel serverless has read-only filesystem; logging is sufficient
    }

    res.json({ success: true, message: 'Thank you! We\'ll send personalized suggestions to your email.' });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Failed to save your details. Please try again.' });
  }
});

module.exports = app;
