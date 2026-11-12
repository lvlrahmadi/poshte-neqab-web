'use strict';
(async function loadBundledPersianFont(){
  try{
    const path='./fonts/noto-nastaliq-urdu.ttf.b64';
    const response=await fetch(path,{cache:'no-store'});
    if(!response.ok)throw new Error('Font file unavailable: '+path+' ('+response.status+')');
    const encoded=(await response.text()).replace(/\s+/g,'');
    if(!encoded||encoded.length<1000)throw new Error('Nastaliq font data is empty or incomplete');
    const face=new FontFace('NastaliqLocal','url(data:font/ttf;base64,'+encoded+')',{weight:'400 700'});
    await face.load();
    document.fonts.add(face);
    await document.fonts.load('400 16px "NastaliqLocal"');
    document.documentElement.classList.add('nastaliq-loaded');
    console.info('Nastaliq font loaded');
  }catch(error){console.error('Nastaliq font could not be loaded',error);}
})();
