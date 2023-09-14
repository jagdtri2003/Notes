const onAdd = async () => {
  const title = document.getElementById("note-title").value;
  const content = document.getElementById("note-content").value;
  const closeButton = document.getElementById("btn-close");

  if (title.trim() === "" || content.trim() === "") {
    alert("Please fill in all fields");
    return;
  }

  const res = await fetch("/addnote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  });

  const msg = await res.json();

  if (msg.code === "Success") {
    localStorage.setItem('noteAdded','true');
    // alert("Note added successfully !");
    location.reload();
  } else {
    alert("Error in adding note");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const deleteIcons = document.querySelectorAll(".delete-icon");

  deleteIcons.forEach((deleteIcon) => {
    deleteIcon.addEventListener("click", (e) => {
      e.preventDefault();
      const noteId = deleteIcon.getAttribute("data-note-id");

      fetch(`/delete/notes/${noteId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem('noteDeleted',true);
          location.reload();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });
});

const signOut = async () => {
  const res = await fetch("/signout", {
    method: "GET",
  });
  const response = await res.json();
  const code = response.code;
  if (code === "success") {
    document.getElementById("err").style.display = "block";
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  }
};

// Function to open the edit modal with note details
function openEditModal(noteId, noteTitle, noteContent) {
  document.getElementById("editNoteTitle").value = noteTitle;
  document.getElementById("editNoteContent").value = noteContent;
  document.getElementById('editNoteModal').setAttribute('noteId',noteId);

  // Show the edit modal
  const editNoteModal = new bootstrap.Modal(
    document.getElementById("editNoteModal")
  );
  editNoteModal.show();
}

// Function to save changes to the edited note
const onEdit = async () => {
  const editedTitle = document.getElementById("editNoteTitle").value;
  const editedContent = document.getElementById("editNoteContent").value;
  const noteId = document.getElementById('editNoteModal').getAttribute('noteId');

  const res = await fetch(`/editnote/${noteId}`,{
    method:'PUT',
    headers:{
      'Content-Type':'application/json',
    },
    body : JSON.stringify({title:editedTitle , content:editedContent})
  })

  const code = await res.json();
  localStorage.setItem("noteUpdated", "true");

  window.location.reload();

}


document.addEventListener("DOMContentLoaded", () => {
  const noteUpdated = localStorage.getItem("noteUpdated");
  const noteAdded = localStorage.getItem("noteAdded");
  const noteDeleted = localStorage.getItem('noteDeleted');
  const toastLiveExample = document.getElementById("liveToast-1");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample,{
    autohide: true,
    delay: 25000
  });
  if (noteUpdated === "true") {
    document.getElementById('toast-content').innerText="Note Updated Successfully !";
    localStorage.removeItem("noteUpdated");
    toastBootstrap.show();

  }else if(noteAdded==='true'){
    document.getElementById('toast-content').innerText='Note Added Successfully!';
    localStorage.removeItem('noteAdded');
    toastBootstrap.show();
  }else if(noteDeleted==='true'){
    document.getElementById('toast-content').innerText='Note Deleted Successfully!';
    toastLiveExample.style.backgroundColor='#ffaaaa';
    toastLiveExample.style.boxShadow=" 0 0 1px #740606,0 0 1px #740606,0 0 3px #740606,0 2px 0 #740606";
    toastBootstrap.show();
    localStorage.removeItem('noteDeleted');
  }
});
