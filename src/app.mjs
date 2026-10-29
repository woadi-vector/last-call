import { readFile } from 'node:fs/promises';
import { Finale } from './finale.mjs';

const assets = new Map([
  ['/', ['dashboard.html','text/html; charset=utf-8']],
  ['/demo', ['dashboard.html','text/html; charset=utf-8']],
  ['/overlay', ['overlay.html','text/html; charset=utf-8']],
  ['/style.css', ['style.css','text/css; charset=utf-8']],
  ['/overlay.css', ['overlay.css','text/css; charset=utf-8']],
  ['/client.js', ['client.js','text/javascript; charset=utf-8']],
  ['/bar', ['bar.html','text/html; charset=utf-8']],
  ['/curate', ['curate.html','text/html; charset=utf-8']],
  ['/finale.js', ['finale.js','text/javascript; charset=utf-8']],
  ['/finale.css', ['finale.css','text/css; charset=utf-8']],
]);

export function createHandler({config,twitch,game,demoGame,finale=new Finale(game),demoFinale=new Finale(demoGame)}) {
  const hosts = new Set([`localhost:${config.port}`,`127.0.0.1:${config.port}`]);
  const origins = new Set([...hosts].map(host => `http://${host}`));
  return async (req,res) => {
    const respond = (status,body,type='application/json; charset=utf-8') => {
      res.writeHead(status, {
        'Content-Type':type, 'Cache-Control':'no-store',
        'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer',
        'Content-Security-Policy':"default-src 'none'; script-src 'self'; connect-src 'self'; media-src 'self'; style-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
      });
      res.end(typeof body === 'string' ? body : JSON.stringify(body));
    };
    const redirect = location => { res.writeHead(302,{'Location':location,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}); res.end(); };
    try {
      if (!hosts.has(req.headers.host)) return respond(403,{error:'Use the local dashboard address.'});
      const url = new URL(req.url,'http://localhost');
      if (req.method === 'POST') {
        if (!origins.has(req.headers.origin) || req.headers['x-last-call'] !== 'control') return respond(403,{error:'Open controls from the local dashboard.'});
        const demo = url.pathname.startsWith('/api/demo/');
        if (!['/api/control','/api/demo/control','/api/demo/answer','/api/finale/control','/api/demo/finale/control','/api/curator/approve','/api/demo/curator/approve'].includes(url.pathname)) return respond(404,{error:'Not found'});
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 2048) return respond(413,{error:'Request too large'});
        }
        let input;
        try { input = JSON.parse(body); } catch { return respond(400,{error:'Invalid JSON'}); }
        if (!input || typeof input !== 'object') return respond(400,{error:'Invalid request'});
        const selected = demo ? demoGame : game;
        const selectedFinale = demo ? demoFinale : finale;
        if(url.pathname.endsWith('/curator/approve')) {
          try { selectedFinale.approve(input.id); } catch(error) { return respond(409,{error:error.message}); }
          return respond(200,selectedFinale.curatorSnapshot());
        }
        if(url.pathname.endsWith('/finale/control')) {
          if(!demo && input.action==='open-vote' && twitch.snapshot().status!=='Chat subscribed') return respond(409,{error:'Connect Twitch before opening live voting.'});
          try { selectedFinale.act(input.action,input.id); } catch(error) { return respond(409,{error:error.message}); }
          return respond(200,selectedFinale.snapshot());
        }
        if (url.pathname === '/api/demo/answer') {
          if (!Number.isInteger(input.viewer) || input.viewer < 1 || input.viewer > 5) return respond(400,{error:'Choose a demo viewer from 1 to 5'});
          return respond(200,{accepted:input.command ? selectedFinale.vote(`demo-${input.viewer}`,input.command) : selected.answer(`demo-${input.viewer}`,`Guest ${input.viewer}`,`!answer ${input.answer}`)});
        }
        if (!demo && ['start','next','resume'].includes(input.action) && twitch.snapshot().status !== 'Chat subscribed') return respond(409,{error:'Connect Twitch first, or use the separate rehearsal room.'});
        try { selected.act(input.action); } catch (error) { return respond(409,{error:error.message}); }
        if(input.action==='reset') selectedFinale.reset();
        return respond(200,{...selected.snapshot(true),finale:selectedFinale.snapshot()});
      }
      if (req.method !== 'GET' && !(req.method==='HEAD' && url.pathname.startsWith('/media/'))) return respond(405,{error:'Method not allowed'});
      const selectedFinale=url.searchParams.get('demo')==='1' ? demoFinale : finale;
      if(url.pathname==='/api/finale') return respond(200,selectedFinale.snapshot());
      if(url.pathname==='/api/curator') return respond(200,selectedFinale.curatorSnapshot());
      if(url.pathname.startsWith('/media/')) {
        let item;
        if(url.pathname==='/media/finale' && url.searchParams.get('v')===String(selectedFinale.revision)) item=selectedFinale.activeItem();
        const preview=/^\/media\/preview\/([1-3])$/.exec(url.pathname);
        if(preview && !selectedFinale.removed.has(Number(preview[1]))) item=selectedFinale.item(Number(preview[1]));
        if(!item) return respond(403,{error:'No approved segment is playing.'});
        let media;
        try { media=await readFile(new URL(`./media/${item.file}`,import.meta.url)); } catch { return respond(404,{error:'This local segment is unavailable.'}); }
        let start=0,end=media.length-1,status=200;
        if(req.headers.range) {
          const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
          if(!range || Number(range[1])>=media.length || (range[2] && Number(range[2])<Number(range[1]))) {
            res.writeHead(416,{'Content-Range':`bytes */${media.length}`,'Cache-Control':'no-store'}); res.end(); return;
          }
          start=Number(range[1]); end=range[2] ? Math.min(Number(range[2]),end) : end; status=206;
        }
        res.writeHead(status,{'Content-Type':'video/mp4','Content-Length':end-start+1,'Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===206 ? {'Content-Range':`bytes ${start}-${end}/${media.length}`} : {})});
        res.end(req.method==='HEAD' ? undefined : media.subarray(start,end+1)); return;
      }
      if (url.pathname === '/connect') return redirect(twitch.authorizationUrl);
      if (url.pathname === '/auth/callback') {
        try {
          if (url.searchParams.has('error')) throw new Error('declined');
          await twitch.finishAuthorization(url.searchParams.get('code'),url.searchParams.get('state'));
          return redirect('/');
        } catch {
          return respond(400,'Twitch connection failed. Return to http://localhost:'+config.port+' and try again.','text/plain; charset=utf-8');
        }
      }
      if (url.pathname === '/api/status') return respond(200,twitch.snapshot());
      if (url.pathname === '/api/game') return respond(200,{...game.snapshot(),finale:finale.snapshot()});
      if (url.pathname === '/api/producer') return respond(200,{...game.snapshot(true),finale:finale.snapshot()});
      if (url.pathname === '/api/demo') return respond(200,{...demoGame.snapshot(true),finale:demoFinale.snapshot()});
      if (url.pathname === '/api/demo/game') return respond(200,{...demoGame.snapshot(),finale:demoFinale.snapshot()});
      const asset = assets.get(url.pathname);
      if (!asset) return respond(404,{error:'Not found'});
      return respond(200,await readFile(new URL(`./public/${asset[0]}`,import.meta.url),'utf8'),asset[1]);
    } catch {
      if (!res.headersSent) respond(500,{error:'Local request failed. Please retry.'});
      else res.end();
    }
  };
}
