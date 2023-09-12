const onAdd = async () =>{
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const closeButton = document.getElementById('btn-close');

    const res = await fetch('/addnote',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({title,content})
    });

    const msg = await res.json();

    if(msg.code==='Success'){
        //Remove the model and show added toast !!
        closeButton.click();
    }
    else{
        alert("Error in adding note");
    }

}