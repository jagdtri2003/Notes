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
