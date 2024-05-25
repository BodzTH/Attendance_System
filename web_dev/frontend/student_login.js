const submit=document.querySelector('.submit');
submit.addEventListener('click',()=>{
    const id=document.querySelector('.userId').value;
    window.location.href = `http://localhost:3000/studentattendance?id=${encodeURIComponent(order_id)}`;
})