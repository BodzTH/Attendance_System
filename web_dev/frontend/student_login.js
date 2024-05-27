const submit=document.querySelector('.submit');
submit.addEventListener('click',()=>{
    const id=document.querySelector('.userId').value;
    window.location.href = `http://localhost:5090/studentattendance?id=${encodeURIComponent(id)}`;
})