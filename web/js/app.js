// highlight active nav link
(function(){
  const path = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nc-nav a').forEach(a=>{
    if(a.getAttribute('href')===path) a.classList.add('active');
  });
})();
