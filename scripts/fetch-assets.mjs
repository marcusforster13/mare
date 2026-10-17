import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const manifest=JSON.parse(await readFile(new URL('../assets-manifest.json',import.meta.url),'utf8'));
for(const item of manifest){const target=new URL('../public/'+item.path,import.meta.url);let existing;try{existing=await readFile(target);}catch{}if(existing&&createHash('sha256').update(existing).digest('hex')===item.sha256)continue;const response=await fetch(item.url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw new Error(`Asset ${item.path}: HTTP ${response.status}`);const data=Buffer.from(await response.arrayBuffer());if(createHash('sha256').update(data).digest('hex')!==item.sha256)throw new Error(`Integrity mismatch: ${item.path}`);await mkdir(path.dirname(fileURLToPath(target)),{recursive:true});await writeFile(target,data);console.log(`Asset ready: ${item.path}`);}
