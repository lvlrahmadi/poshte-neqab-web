'use strict';
(async function loadBundledPersianFont(){
  try{
    const path='./fonts/arad-vf.woff2.b64';
    const response=await fetch(path,{cache:'no-store'});
    if(!response.ok)throw new Error('Font file unavailable: '+path+' ('+response.status+')');
    const encoded=(await response.text()).replace(/\\s+/g,'');
    if(!encoded||encoded.length<10000)throw new Error('Arad font data is empty or incomplete');
    const face=new FontFace('AradLocal','url(data:font/woff2;base64,'+encoded+')',{weight:'100 1000',style:'normal'});
    await face.load();
    document.fonts.add(face);
    await document.fonts.load('400 16px "AradLocal"');
    document.documentElement.classList.add('arad-loaded');
    console.info('Arad Persian font loaded');
  }catch(error){console.error('Arad font could not be loaded',error);}
})();
