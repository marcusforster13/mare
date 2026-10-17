import {Mesh,Vector2,Vector3,Color,MeshBasicNodeMaterial,PlaneGeometry,DoubleSide,TextureLoader,EquirectangularReflectionMapping,SRGBColorSpace} from 'three/webgpu';
import {uniform,Fn,positionWorld,sin,cos,float,vec3,vec4,smoothstep,abs,mix,pow} from 'three/tsl';
import {params,applySky,SKIES} from './third_party/poseidon/params.js';
import {Ocean} from './third_party/poseidon/Ocean.js';
import {validateFFT} from './third_party/poseidon/fft.js';
import {createOceanSurfaceMaterial} from './third_party/poseidon/oceanSurfaceMaterial.js';
import {makeDetailTexture} from './third_party/poseidon/detailTexture.js';
import {createSkyDome} from './third_party/poseidon/sky.js';
import {createRadialGrid} from './third_party/poseidon/oceanGrid.js';
import {createAerialPerspective} from './third_party/poseidon/atmosphere.js';

export async function createOcean(renderer,scene,camera){
  // A protected beach: moderate wind and low swell, not the upstream open-ocean sea state.
  params.N=innerWidth<700?128:256;params.cascades=3;params.sky='golden';applySky(params);
  params.local.windSpeed=5.2;params.local.scale=.24;params.swell.scale=.014;params.lambda=1.3;params.palette=.15;params.depth=30;
  const c=params.colors;
  const shading={sunDir:uniform(new Vector3()),sunColor:uniform(new Color(c.sun).multiplyScalar(params.sunIntensity)),horizon:uniform(new Color(c.skyHorizon)),zenith:uniform(new Color(c.skyZenith)),ambient:uniform(new Color(c.ambient)),deepColor:uniform(new Color(c.deep)),scatterColor:uniform(new Color(c.scatter)),palette:uniform(params.palette),sssStrength:uniform(params.sssStrength),foamColor:uniform(new Color(c.foam)),foamThreshold:uniform(params.foamThreshold),foamScale:uniform(params.foamScale),foamBright:uniform(params.foamBright),foamRelief:uniform(params.foamRelief),foamMilk:uniform(params.foamMilk),detail:uniform(params.detailStrength),time:uniform(0),originXZ:uniform(new Vector2()),hazeWater:uniform(1/SKIES.golden.hazeWater),hazeAir:uniform(1/SKIES.golden.hazeAir),specBoost:uniform(0)};
  const az=params.sunAzimuth*Math.PI/180,el=params.sunElevation*Math.PI/180;
  shading.sunDir.value.set(Math.cos(el)*Math.sin(az),Math.sin(el),Math.cos(el)*Math.cos(az));
  const sky=createSkyDome(shading,42000);scene.add(sky);scene.fogNode=createAerialPerspective(shading,{density:shading.hazeAir});
  const environment=await new TextureLoader().loadAsync(import.meta.env.BASE_URL+'sky/sky_131_2k.png');environment.mapping=EquirectangularReflectionMapping;environment.colorSpace=SRGBColorSpace;scene.environment=environment;scene.environmentIntensity=.45;
  const fftTest=await validateFFT(renderer,params.N);
  console.info('Ocean FFT validation',JSON.stringify(fftTest));
  if(!fftTest.pass)throw new Error('A verificação da simulação FFT falhou: '+JSON.stringify(fftTest));
  document.documentElement.dataset.fft='passed';
  const ocean=new Ocean(renderer,params);await ocean.updateInitialSpectrum();
  const material=createOceanSurfaceMaterial(ocean.cascades,{lengthScales:params.lengthScales,shading,detailTex:makeDetailTexture()});
  const grid=createRadialGrid({rings:340,sectors:innerWidth<700?256:448,spacing:.28,soften:30});
  const mesh=new Mesh(grid.geometry,material);mesh.frustumCulled=false;scene.add(mesh);
  // A thin, world-anchored shore wash follows the actual shoreline of the beach mesh.
  const shoreTime=uniform(0),shore=new MeshBasicNodeMaterial({transparent:true,depthWrite:false,side:DoubleSide});
  shore.colorNode=vec3(.93,.91,.81);
  shore.opacityNode=Fn(()=>{const p=positionWorld;const tide=sin(shoreTime.mul(.42)).mul(.6);const coastline=float(-13.35).sub(sin(p.x.mul(.12)).mul(2.3));const distance=abs(p.z.sub(coastline).add(tide));const line=sin(p.z.mul(4.2).add(shoreTime.mul(1.4)).add(sin(p.x.mul(.9))));const broken=sin(p.x.mul(17).add(p.z.mul(9))).mul(cos(p.z.mul(25))).mul(.2).add(.7);return smoothstep(2.5,.1,distance).mul(smoothstep(.5,1,line)).mul(broken).mul(.6);})();
  const wash=new Mesh(new PlaneGeometry(480,22),shore);wash.rotation.x=-Math.PI/2;wash.position.set(0,.025,-16);wash.frustumCulled=false;scene.add(wash);
  return{params,fftTest,update(time,dt){ocean.evolve(time*.65,Math.min(dt,.05)*.65);shading.time.value=time*.65;shoreTime.value=time;const ox=Math.round(camera.position.x/grid.innerSpacing)*grid.innerSpacing,oz=Math.round(camera.position.z/grid.innerSpacing)*grid.innerSpacing;mesh.position.set(ox,0,oz);shading.originXZ.value.set(ox,oz);sky.position.copy(camera.position);}};
}
