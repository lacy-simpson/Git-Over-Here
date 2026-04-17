(function(){
  var t=localStorage.getItem('git-guide-theme');if(t)document.documentElement.setAttribute('data-theme',t);
  var s=localStorage.getItem('git-guide-sidebar');
  document.documentElement.setAttribute('data-sidebar',s==='closed'?'closed':'open');
})();
