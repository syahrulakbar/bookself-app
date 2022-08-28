const readingButton = document.querySelector(".reading-button");
const completeButton = document.querySelector(".complete-button");
const cancelButton = document.querySelector(".cancel-button");
const readingContainer = document.querySelector(".container-reading");
const completeContainer = document.querySelector(".container-complete");
const searchBook = document.querySelector("#search-input");

const blurAction = document.querySelector(".blur");
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSELF-APPS";
const books = [];
const RENDER_EVENT = "render-book";

cancelButton.addEventListener("click", function () {
  clearInput();
});

readingButton.addEventListener("click", function () {
  readingButton.classList.add("active");
  completeButton.classList.remove("active");

  readingContainer.removeAttribute("hidden");
  completeContainer.setAttribute("hidden", true);

  document.dispatchEvent(new Event(RENDER_EVENT));
});

searchBook.addEventListener("keyup", function (e) {
  const searchList = e.target.value.toLowerCase();
  const itemList = document.querySelectorAll(".info");

  itemList.forEach((item) => {
    const isiItem = item.querySelector(".title").textContent.toLowerCase();

    if (isiItem.indexOf(searchList) != -1) {
      item.parentNode.setAttribute("style", "display: block");
    } else {
      item.parentNode.setAttribute("style", "display: none !important");
    }
  });
});

function clearInput() {
  const inputs = document.querySelectorAll("input");

  inputs.forEach((input) => {
    input.value = "";
    input.checked = "";
  });
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Your browser does not support local storage!");
    return false;
  }
  return true;
}

completeButton.addEventListener("click", function () {
  readingButton.classList.remove("active");
  completeButton.classList.add("active");

  readingContainer.setAttribute("hidden", true);
  completeContainer.removeAttribute("hidden");

  document.dispatchEvent(new Event(RENDER_EVENT));
});

function generatedId() {
  return +new Date();
}

function generateBookObject(id, title, author, realese, isCompleted) {
  return {
    id,
    title,
    author,
    realese,
    isCompleted,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    clearInput();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const generatedID = generatedId();
  const titleField = document.getElementById("title-field").value;
  const authorField = document.getElementById("author-field").value;
  const realese = document.getElementById("year-field").value;
  const isCompleted = document.getElementById("finished-read-checkbox").checked;
  const bookObject = generateBookObject(generatedID, titleField, authorField, realese, isCompleted, false);
  books.push(bookObject);
  Swal.fire({
    icon: "success",
    title: `Successfully Added Book ${bookObject.title}`,
    showConfirmButton: false,
    timer: 1500,
  });

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTitleToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}
function removeTitleFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function readingTitleFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h4");
  textTitle.classList.add("title");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.classList.add("author");
  textAuthor.innerText = `Author: ${bookObject.author}`;

  const textRealese = document.createElement("p");
  textRealese.classList.add("publised-year");
  textRealese.innerText = `Publised Year: ${bookObject.realese}`;

  const bookImg = new Image(100, 100);
  bookImg.src = "assets/img/open-book.png";
  bookImg.classList.add("book-reading");
  const bookReading = document.createElement("div");
  bookReading.classList.add("book-image-reading");
  bookReading.append(bookImg);

  const bookDone = new Image(100, 100);
  bookDone.src = "assets/img/book.png";
  bookDone.classList.add("book-complete");
  const bookComplete = document.createElement("div");
  bookComplete.classList.add("book-image-complete");
  bookComplete.append(bookDone);

  const textContainer = document.createElement("div");
  textContainer.classList.add("info");

  if (bookObject.isCompleted) {
    textContainer.append(bookComplete, textTitle, textAuthor, textRealese);
  } else {
    textContainer.append(bookReading, textTitle, textAuthor, textRealese);
  }

  const delImg = document.createElement("i");
  delImg.classList.add("fa-solid", "fa-trash");
  const delButton = document.createElement("button");
  delButton.classList.add("delete");

  delButton.append(delImg);
  const delConfirm = document.querySelector(".ok-del");

  delButton.addEventListener("click", function () {
    blurAction.classList.add("on");
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "Once Deleted, Your Book Totally Removed!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire("Deleted!", "Your book has been deleted.", "success");
          removeTitleFromCompleted(bookObject.id);
          blurAction.classList.remove("on");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            icon: "error",
            title: "Your Book Is Cancelled!",
            showConfirmButton: false,
            timer: 1000,
          });
          blurAction.classList.remove("on");
        } else {
          blurAction.classList.remove("on");
        }
      });
  });

  const container = document.createElement("li");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`, "style", "display: block");

  if (bookObject.isCompleted) {
    const readingAction = document.createElement("button");
    readingAction.classList.add("reading");
    readingAction.innerText = "Move to Reading";
    textContainer.append(delButton, readingAction);

    readingAction.addEventListener("click", function () {
      Swal.fire({
        icon: "success",
        title: "Success move book",
        showConfirmButton: false,
        timer: 1000,
      });
      readingTitleFromCompleted(bookObject.id);
    });
  } else {
    const completeAction = document.createElement("button");
    completeAction.classList.add("complete");
    completeAction.innerText = "Move to Complete";

    textContainer.append(delButton, completeAction);

    completeAction.addEventListener("click", function () {
      Swal.fire({
        icon: "success",
        title: "Yeyy, finished reading!",
        showConfirmButton: false,
        timer: 1000,
      });
      addTitleToCompleted(bookObject.id);
    });
  }

  return container;
}

document.addEventListener(SAVED_EVENT, function () {
  const generatedID = generatedId();
  const titleField = document.getElementById("title-field").value;
  const authorField = document.getElementById("author-field").value;
  const realese = document.getElementById("year-field").value;
  const isCompleted = document.getElementById("finished-read-checkbox").checked;
  const bookObject = generateBookObject(generatedID, titleField, authorField, realese, isCompleted, false);
});
function getCrudData() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  return data;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const readingList = document.getElementById("book-list-reading");
  readingList.innerHTML = "";

  const completeList = document.getElementById("book-list-complete");
  completeList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) readingList.append(bookElement);
    else completeList.append(bookElement);
  }
  searchBook.value = "";
});
