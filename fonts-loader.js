'use strict';
(async function loadBundledPersianFonts(){
  async function loadFont(name,path,weight='400'){
    const response=await fetch(path+'?v=2',{cache:'no-store'});
    if(!response.ok)throw new Error('Font file unavailable: '+path+' ('+response.status+')');
    const encoded=(await response.text()).replace(/\\s+/g,'');
    if(!encoded||encoded.length<1000)throw new Error('Font data is empty or incomplete: '+path);
    const face=new FontFace(name,'url(data:font/ttf;base64,'+encoded+')',{weight});
    await face.load();
    document.fonts.add(face);
    await document.fonts.load(weight+' 16px "'+name+'", sans-serif');
    return name;
  }
  try{
    await loadFont('HomaLocal','./fonts/homa.ttf.b64');
    document.body.style.fontFamily="'HomaLocal',Tahoma,Arial,sans-serif";
    document.documentElement.classList.add('homa-loaded');
    console.info('Homa font loaded');
  }catch(error){console.error('Homa font could not be loaded',error);}
  try{
    await loadFont('NastaliqLocal','./fonts/noto-nastaliq-urdu.ttf.b64','400 700');
    document.documentElement.classList.add('nastaliq-loaded');
    console.info('Noto Nastaliq font loaded');
  }catch(error){console.error('Nastaliq font could not be loaded',error);}
})();