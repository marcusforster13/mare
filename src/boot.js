import './style.css';
const status=document.querySelector('#loadingStatus');
try{
  const compat=new URLSearchParams(location.search).has('compat');
  const adapter=!compat&&navigator.gpu?await navigator.gpu.requestAdapter():null;
  document.documentElement.dataset.renderer=adapter?'webgpu':'webgl2';
  if(adapter){await import('./main.js');}else{status.textContent='Preparando o modo compatível…';await import('./legacy.js');}
}catch(error){
  console.error('Maré initialization:',error);
  document.querySelector('#loading')?.remove();
  const fatal=document.querySelector('#fatal');fatal.classList.remove('hidden');
  fatal.innerHTML='<h2>O modo avançado não pôde iniciar</h2><p>Seu navegador pode não ter memória gráfica disponível. Você pode jogar no modo compatível.</p><button id="compatMode">Jogar no modo compatível</button>';
  document.querySelector('#compatMode').onclick=()=>{const u=new URL(location.href);u.searchParams.set('compat','1');location.assign(u);};
}
