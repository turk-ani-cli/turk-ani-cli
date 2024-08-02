import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export async function fetchBolumler(animeId: string): Promise<string[] | null> { // bölüm adlarını döndürmek için türü string[] | null olarak ayarlayın
    const url = `https://www.turkanime.co/ajax/bolumler&animeId=${animeId}`;
    
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    };

    const bolumler: string[] = []; // Bölüm adlarını saklamak için dizi

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`HTTP Hatası: ${response.status}`);
        }

        const data = await response.text();
        
        const $ = cheerio.load(data);
        
        const bolumElemanlari = $('.bolumAdi');
        const hrefLink = $('a').attr('href');

        bolumElemanlari.each((index, element) => {
            bolumler.push($(element).text().trim()); 
        });


        return bolumler.length > 0 ? bolumler : null; // Eğer bölüm varsa döndür
    } catch (error) {
        console.error('Hata:', error);
        return null; // Hata durumunda null döndür
    }
}