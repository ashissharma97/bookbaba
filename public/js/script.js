$('#error-password').hide();
$('#valid-password').hide();
$('#valid-password-char').hide();
$('#error-password-char').hide();
$('#inputhide').hide();

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    if($("#wrapper").hasClass("toggled")){
      $(this).html('Pull Menu')
    }
    else{
      $(this).html('Push Menu')
    }
  });

window.addEventListener('load',function(){
  const loader = document.querySelector('.loader');
  loader.className += " hidden";
})
$('#password').keyup(function () {
  if($(this).val().length>=8){
    $('#valid-password-char').show();
    $('#error-password-char').hide();
  }
  else{
    $('#valid-password-char').hide();
    $('#error-password-char').show();
  }
});
$('#confirm_password').keyup(function () {
  if($('#password').val() == $('#confirm_password').val()){
    $('#valid-password').show();
    $('#error-password').hide();
  }
  else{
    $('#error-password').show();
    $('#valid-password').hide();
  }
});
function addToCart(data){
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: "/book/cart",
    data: JSON.stringify({
      book_id: data,
  }),
  error:function(){
    alertify.error('Please Login to Add to Cart');
  },
  success:function(){
    $('#cart').html('Added')
    alertify.success('Added Successful');
  }
  });
}
$('#registration').click(function(){
  $(this).html('Regisetring...')
})
$('#login').click(function(){
  $(this).html('Logging...')
})
$('#order').click(function(){
  $(this).html('Ordering...')
})


$('#ifsc').keyup(function () {
  fetch(`https://ifsc.razorpay.com/${$(ifsc).val()}`)
.then((response)=> {return response.json()})
.then((data)=>{
  if(data != 'Not Found'){
    $('#ifscDetails').html(`${data.BANK} ${data.ADDRESS}`)
  }
  else{
    $('#ifscDetails').html(`Enter Valid IFSC`)
  }
})
});