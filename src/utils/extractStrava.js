import { createWorker } from 'tesseract.js';

let worker = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng+fra');
  }
  return worker;
}

/**
 * Extract running data from a Strava screenshot.
 * Returns { distance, pace, avgHR } — any field may be null if not found.
 */
export async function extractStravaData(imageDataUrl) {
  const w = await getWorker();
  const { data: { text } } = await w.recognize(imageDataUrl);

  const result = { distance: null, pace: null, avgHR: null };
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  // --- DISTANCE ---
  // Strava shows distance like "12,5" or "12.5" near "km" or "Kilomètres" or "Distance"
  // Also matches standalone numbers followed by km
  const distPatterns = [
    /(\d{1,3}[.,]\d{1,2})\s*(?:km|kilo)/i,
    /(?:distance|dist)[:\s]*(\d{1,3}[.,]\d{1,2})/i,
    /(\d{1,3}[.,]\d{1,2})\s*km/i,
  ];
  for (const pat of distPatterns) {
    const m = fullText.match(pat);
    if (m) {
      result.distance = parseFloat(m[1].replace(',', '.'));
      break;
    }
  }

  // --- PACE ---
  // Strava shows pace like "5:30" or "5'30" near "/km" or "Allure" or "Pace"
  const pacePatterns = [
    /(\d{1}[:']\d{2})\s*(?:\/km|min\/km)/i,
    /(?:allure|pace|vitesse)[:\s]*(\d{1}[:']\d{2})/i,
    /(\d{1}[:']\d{2})\s*(?:min)/i,
  ];
  for (const pat of pacePatterns) {
    const m = fullText.match(pat);
    if (m) {
      result.pace = m[1].replace("'", ':');
      break;
    }
  }

  // --- HEART RATE ---
  // Strava shows HR like "138" near "bpm" or "FC" or "Heart" or "avg"
  const hrPatterns = [
    /(\d{2,3})\s*(?:bpm)/i,
    /(?:fc|fr[ée]q|heart|hr|cardio)[.\s:]*(?:moy|avg|moyenne)?[.\s:]*(\d{2,3})/i,
    /(?:moy|avg|moyenne)[.\s:]*(\d{2,3})\s*(?:bpm)?/i,
  ];
  for (const pat of hrPatterns) {
    const m = fullText.match(pat);
    if (m) {
      const hr = parseInt(m[1] || m[2]);
      // Sanity check — HR should be between 60 and 220
      if (hr >= 60 && hr <= 220) {
        result.avgHR = hr;
        break;
      }
    }
  }

  return result;
}
