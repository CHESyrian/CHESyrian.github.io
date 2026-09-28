(function(){
  function setProfile(){
    var img=document.getElementById('profile-photo');
    if(img && window.PROFILE_IMG){ img.src=window.PROFILE_IMG; }
  }
  function setCert(slotId, data, alt){
    var slot=document.getElementById(slotId);
    if(!slot || !data) return;
    var a=document.createElement('a');
    a.className='cert-img-link';
    a.href=data; a.target='_blank'; a.rel='noopener'; a.title='Open certificate';
    var img=document.createElement('img');
    img.className='cert-img'; img.src=data; img.alt=alt; img.loading='lazy';
    a.appendChild(img); slot.appendChild(a);
  }
  function init(){
    setProfile();
    setCert('cert-ds-slot', window.CERT_DS_IMG, 'IBM Data Science Professional Certificate');
    setCert('cert-da-slot', window.CERT_DA_IMG, 'IBM Data Analyst Professional Certificate');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
