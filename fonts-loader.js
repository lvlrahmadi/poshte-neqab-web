'use strict';
(async function loadBundledPersianFonts(){
  async function loadFont(name,path,weight='400'){
    const response=await fetch(path,{cache:'force-cache'});
    if(!response.ok)throw new Error('Font file unavailable: '+path);
    const encoded=(await response.text()).trim();
    const face=new FontFace(name,'url(data:font/ttf;base64,'+encoded+')',{weight});
    await face.load();
    document.fonts.add(face);
    return name;
  }
  try{
    await loadFont('HomaLocal','./fonts/homa.ttf.b64');
    document.documentElement.style.setProperty('--app-font',"'HomaLocal',Tahoma,Arial,sans-serif");
    document.body.style.fontFamily="var(--app-font)";
  }catch(error){console.warn('Homa font could not be loaded',error);}
  try{
    await loadFont('NastaliqLocal','./fonts/noto-nastaliq-urdu.ttf.b64','400 700');
    document.documentElement.classList.add('has-nastaliq');
  }catch(error){console.warn('Nastaliq font could not be loaded',error);}
})();
