const onAdd = async () => {
  const title = document.getElementById("note-title").value;
  const content = document.getElementById("note-content").value;
  const closeButton = document.getElementById("btn-close");

  const res = await fetch("/addnote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  });

  const msg = await res.json();

  if (msg.code === "Success") {
    //Remove the model and show added toast !!
    closeButton.click();
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
