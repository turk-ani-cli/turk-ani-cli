import { Command } from 'commander';
const program = new Command();
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import prompts from 'prompts';
import { fetchBolumler } from './episode'; // episode.ts dosyasını içe aktar

interface Result {
  title: string;
  animeId: string; // Added animeId to the Result interface
}

program
  .version('0.0.1')
  .description('Turk-Ani-CLI, Türkçe anime izlemek için geliştirilmiş bir CLI aracı')
  .option('-a, --anime <name>', 'Anime bul');

program.parse(process.argv);

const options = program.opts();
if (options.anime) {
  console.log(`Anime bilgisi getiriliyor: ${options.anime}`);
  search(options.anime).then((results) => {
    if (results === null) return console.log('Anime bulunamadı.');

    prompt(results as Result[]);
  });
}

async function search(query: string) {
  const fd = new URLSearchParams();
  fd.append('arama', query);

  const results: Result[] = [];
  const seenTitles = new Set<string>(); // Track seen titles

  try {
    const response = await fetch("https://www.turkanime.co/arama", {
      method: 'POST',
      body: fd,
    });
    const text = await response.text();
    const $ = cheerio.load(text);

    $('#orta-icerik .panel-body').each((index, element) => {
      const titleElement = $(element).find('.media-heading a');
      const title = titleElement.text().trim();
      const animeId = $(element).find('.btn-def.reactions').data('unique-id') as string;

      if (title && animeId && !seenTitles.has(title)) {
        results.push({ title, animeId });
        seenTitles.add(title); // Mark this title as seen
      }
    });
    
    return results.length > 0 ? results : null;
  } catch (error) {
    console.log('[HATA] ', error);
  }
}

async function prompt(results: Result[]) {
  const choices = results.map((result) => ({
    title: result.title,
    value: result.animeId, // Use animeId as the value for selection
  }));

  try {
    const response: { selectedAnimeId: string } = await prompts({
      type: 'select',
      name: 'selectedAnimeId',
      message: 'Bir anime seçin:',
      choices: choices,
    });

    console.log(`Seçilen anime ID: ${response.selectedAnimeId}`);
    
    // Bölümleri çekmek için fetchBolumler fonksiyonunu çağır
    const bolumler = await fetchBolumler(response.selectedAnimeId);
    if (bolumler) {
      promptBolumSec(bolumler);
    }
  } catch (error) {
    console.log('[HATA] ', error);
  }
}

async function promptBolumSec(bolumler: string[]) {
  const choices = bolumler.map((bolum, index) => ({
    title: bolum,
    value: index,
  }));

  try {
    const response: { selectedBolumIndex: number } = await prompts({
      type: 'select',
      name: 'selectedBolumIndex',
      message: 'Bir bölüm seçin:',
      choices: choices,
    });

    console.log(`Seçilen bölüm: ${bolumler[response.selectedBolumIndex]}`);
  } catch (error) {
    console.log('[HATA] ', error);
  }
}
