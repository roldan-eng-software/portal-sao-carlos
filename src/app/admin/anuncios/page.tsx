import fs from 'fs';
import path from 'path';
import AnunciosTable from './AnunciosTable';

const PENDING_ADS_PATH = path.join(process.cwd(), 'src/content/pending-ads.json');

function readPendingAds() {
  try {
    const content = fs.readFileSync(PENDING_ADS_PATH, 'utf-8');
    const data = JSON.parse(content);
    return data.items || [];
  } catch {
    return [];
  }
}

export default function AdminAnunciosPage() {
  const pendingAds = readPendingAds();
  return <AnunciosTable initialAds={pendingAds} />;
}