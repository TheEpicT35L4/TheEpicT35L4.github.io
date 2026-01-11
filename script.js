// Simple station grid + RSS headline fetcher using AllOrigins CORS proxy.
// Edit feeds.json to add your own sources.
// Example feed types: "youtube_channel", "youtube_video", "audio", "embed", "rss"

const ALLORIGINS = 'https://api.allorigins.win/raw?url='; // returns raw content

async function loadFeeds(){
  const res = await fetch('feeds.json');
  if(!res.ok) throw new Error('Unable to load feeds.json');
  return res.json();
}

function createCard(feed){
  const card = document.createElement('article');
  card.className = 'card';
  const title = document.createElement('h3');
  title.textContent = feed.name || 'Unnamed';
  card.appendChild(title);

  if(feed.source) {
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = feed.source;
    card.appendChild(meta);
  }

  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'media';

  if(feed.type === 'youtube_channel'){
    // Embed channel live stream (works if the channel has a live broadcast)
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(feed.channelId)}&rel=0`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    mediaWrap.appendChild(iframe);
  } else if(feed.type === 'youtube_video'){
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(feed.videoId)}?rel=0`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    mediaWrap.appendChild(iframe);
  } else if(feed.type === 'audio'){
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = feed.url;
    audio.preload = 'none';
    mediaWrap.appendChild(audio);
  } else if(feed.type === 'embed'){
    const iframe = document.createElement('iframe');
    iframe.src = feed.url;
    iframe.sandbox = '';
    mediaWrap.appendChild(iframe);
  } else {
    // fallback
    const p = document.createElement('div');
    p.style.padding='12px';
    p.textContent = 'No embeddable media for this card.';
    mediaWrap.appendChild(p);
  }

  card.appendChild(mediaWrap);

  if(feed.rss){
    const headlines = document.createElement('div');
    headlines.className = 'headlines';
    headlines.textContent = 'Loading headlines…';
    card.appendChild(headlines);

    // fetch RSS and populate
    fetchRss(feed.rss).then(items=>{
      headlines.textContent = '';
      const ul=document.createElement('ul');
      items.slice(0,6).forEach(it=>{
        const li=document.createElement('li');
        const a=document.createElement('a');
        a.href=it.link;
        a.textContent=it.title;
        a.target='_blank';
        a.rel='noopener noreferrer';
        li.appendChild(a);
        ul.appendChild(li);
      });
      headlines.appendChild(ul);
    }).catch(err=>{
      headlines.textContent = 'Failed to load headlines';
      console.error(err);
    });
  }

  return card;
}

async function fetchRss(url){
  const proxied = ALLORIGINS + encodeURIComponent(url);
  const res = await fetch(proxied);
  if(!res.ok) throw new Error('RSS fetch failed');
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const items = [...doc.querySelectorAll('item')].map(item=>{
    const title = item.querySelector('title')?.textContent || 'No title';
    const link = item.querySelector('link')?.textContent || item.querySelector('guid')?.textContent || '#';
    const pub = item.querySelector('pubDate')?.textContent || '';
    return {title, link, pub};
  });
  return items;
}

function tickHeadlineList(allItems){
  const ticker = document.getElementById('ticker');
  if(!ticker) return;
  const flattened = allItems.flat();
  const headlines = flattened.map(i=>({title:i.title, link:i.link}));
  let idx = 0;
  if(headlines.length===0){ ticker.textContent='No headlines available.'; return; }
  function showNext(){
    const cur = headlines[idx % headlines.length];
    ticker.innerHTML = `<a href="${cur.link}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">${cur.title}</a>`;
    idx++;
  }
  showNext();
  setInterval(showNext, 7000);
}

(async function init(){
  try{
    const feeds = await loadFeeds();
    const grid = document.getElementById('grid');
    const allRssItems = [];
    for(const feed of feeds){
      const card = createCard(feed);
      grid.appendChild(card);
      if(feed.rss){
        // parallel fetching for ticker
        fetchRss(feed.rss).then(items=>{
          allRssItems.push(items.slice(0,5));
        }).catch(()=>{ /* ignore */ });
      }
    }

    // wait a short while for RSS fetches to populate then start ticker
    setTimeout(()=>tickHeadlineList(allRssItems), 1500);

  }catch(err){
    console.error(err);
    const grid = document.getElementById('grid');
    grid.innerHTML = '<div class="card"><h3>Error</h3><p class="meta">Could not load feeds.json — check console</p></div>';
  }
})();
