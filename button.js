const counter = document.querySelector('#counterValue');
const buttonDecrement = document.querySelector('#buttonDecrement');
const buttonIncrement = document.querySelector('#buttonIncrement');

let  value = counter.value;

buttonIncrement.addEventListener('click',() => {
  value = ++value;
  counter.value = value;
});
buttonDecrement.addEventListener('click', () => {
  if(value > 0){
      value = value !== 0 ? --value : 0; 
      counter.value = value;

}
});

var meuBotao = document.getElementById("buttonConfirmed");
meuBotao.addEventListener("click", function() {
  window.location.replace("../carrinho/carrinho.html");
});