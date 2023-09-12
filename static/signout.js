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
