// Servidor independente, sem npm install. Node.js 22 ou superior.
import http from 'node:http';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serve} from './lib/service.mjs';
import {resolvePublicFile} from './lib/static-path.mjs';
const root=dirname(fileURLToPath(import.meta.url)),dir=resolve(root,'data');await mkdir(dir,{recursive:true});
const rooms=new Map();try{for(const [k,v] of Object.entries(JSON.parse(await readFile(resolve(dir,'rooms.json'),'utf8'))))if(Date.now()-v.updated<172800000)rooms.set(k,v)}catch(e){if(e.code!=='ENOENT')throw e}
let dirty=false,writing=false;
async function flush(){if(!dirty||writing)return;writing=true;dirty=false;try{await writeFile(resolve(dir,'rooms.tmp'),JSON.stringify(Object.fromEntries(rooms)));await rename(resolve(dir,'rooms.tmp'),resolve(dir,'rooms.json'))}catch(e){dirty=true;console.error('Falha ao salvar salas:',e.message)}finally{writing=false}}
const store={async get(k){return rooms.has(k)?structuredClone(rooms.get(k)):null},async insert(k,r){if(rooms.has(k))return false;if(rooms.size>=2000)throw Error('Servidor cheio; tente mais tarde.');rooms.set(k,structuredClone(r));dirty=true;return true},async save(k,r,v){if(rooms.get(k)?.version!==v)return false;rooms.set(k,structuredClone(r));dirty=true;return true}};
setInterval(()=>{for(const [k,r] of rooms)if(Date.now()-r.updated>172800000){rooms.delete(k);dirty=true}flush()},2000).unref();
const rates=new Map();setInterval(()=>rates.clear(),60000).unref();
const server=http.createServer(async(req,res)=>{try{const key=req.socket.remoteAddress,rate=rates.get(key)||0;rates.set(key,rate+1);if(rate>900){res.writeHead(429);res.end('Muitas solicitações.');return}const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/game'){if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`){res.writeHead(403);res.end('Origem inválida');return}let body='';for await(const chunk of req){body+=chunk;if(body.length>4096){res.writeHead(413);res.end();return}}const request=new Request(url,{method:req.method,headers:req.headers,body:req.method==='GET'?undefined:body});const response=await serve(request,store);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return}
const file=resolvePublicFile(root,url.pathname);if(!file){res.writeHead(403);res.end();return}const bytes=await readFile(file),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(bytes)
}catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end('Não foi possível atender à solicitação.')}});
const port=Number(process.env.PORT||3000);server.listen(port,'0.0.0.0',()=>console.log(`Mesa de Bar: http://localhost:${server.address().port}\nNa rede local, use o IP deste computador e a porta ${port}.`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(async()=>{while(writing)await new Promise(r=>setTimeout(r,50));await flush();process.exit(0)})});
