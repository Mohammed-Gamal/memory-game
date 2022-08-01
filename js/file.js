let timer = 300, // time in seconds
  duration = 1000,
  allMatched = 0,
  blocks,
  orderRange,
  countdownInterval,
  timerContainer = document.querySelector(".game-container .game-timer"),
  blocksContainer = document.querySelector(".game-container .game-blocks"),
  tries = document.querySelector(".game-info .tries span");

// handle start game button
document.querySelector(".control-button span").onclick = () => {
  let username = prompt("Enter your name:");
  if (username === "" || username === null) {
    document.querySelector(".game-info .name span").innerHTML = "Unknown";
  } else {
    document.querySelector(".game-info .name span").innerHTML = username;
  }

  let startAudio = document.getElementById("gamestart");
  startAudio.play();
  startAudio.volume = 0.3;
  startAudio.loop = true;

  document.querySelector(".control-button").remove();

  countdown(timer);
  hints(duration + 1500);
};

renderBlocks();

async function getData(apiLink) {
  try {
    let connection = await fetch(apiLink);
    console.log("Connection Established!");
    return await connection.json();
  } catch {
    console.log(Error("Failed to establish a connection!"));
  }
}

async function renderBlocks() {
  let responses = await getData("imgs/images.json");

  // create the game blocks
  createBlocks(responses);

  blocks = Array.from(blocksContainer.children);
  orderRange = [...Array(blocks.length).keys()];

  check(blocks, orderRange);

  console.log(blocks);
  console.log(orderRange);
}

// create blocks function
function createBlocks(responses) {
  responses.forEach((response) => {
    for (let i = 0; i < 2; i++) {
      let blockDiv = document.createElement("div");
      blockDiv.className = "block";
      blockDiv.setAttribute("data-tech", response.title);

      let frontDiv = document.createElement("div");
      frontDiv.className = "face front";
      blockDiv.appendChild(frontDiv);

      let backDiv = document.createElement("div");
      backDiv.className = "face back";
      backDiv.innerHTML = response.icon;
      blockDiv.appendChild(backDiv);

      blocksContainer.appendChild(blockDiv);
    }
  });
}

function check(blocks, orderRange) {
  shuffle(orderRange);

  blocks.forEach((block, index) => {
    block.style.order = orderRange[index];

    block.addEventListener("click", () => {
      if (allMatched !== blocks.length / 2) {
        block.classList.add("is-flipped");

        let flippedBlocks = blocks.filter((block) =>
          block.classList.contains("is-flipped")
        );

        if (flippedBlocks.length === 2) changeStatus(flippedBlocks);

        if (allMatched === blocks.length / 2) {
          gameOver();
        }
      }
    });
  });
}

function changeStatus(blocks) {
  let card_timer;

  blocksContainer.classList.add("no-click");

  blocks.reduce((curr, next) => {
    if (curr.dataset.tech === next.dataset.tech) {
      curr.classList.add("matched");
      next.classList.add("matched");
      document.getElementById("success").play();
      clearTimeout(card_timer);
      allMatched++;
    } else {
      tries.innerHTML = parseInt(tries.innerHTML) + 1;
      document.getElementById("fail").play();
    }

    card_timer = setTimeout(() => {
      blocks.forEach((block) => block.classList.remove("is-flipped"));
      blocksContainer.classList.remove("no-click");
    }, duration);
  });
}

// shffle elements function
function shuffle(array) {
  let current = array.length,
    random;

  while (current > 0) {
    random = Math.floor(current * Math.random());
    current--;
    [array[current], array[random]] = [array[random], array[current]];
  }

  return array;
}

// handle countdown
function countdown(duration) {
  let minutes, seconds;

  countdownInterval = setInterval(() => {
    minutes = parseInt(duration / 60);
    seconds = parseInt(duration % 60);

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    timerContainer.innerHTML = `${minutes}:${seconds}`;

    if (--duration < 0) {
      clearInterval(countdownInterval);
      gameOver();
    }
  }, 1000);
}

// handle hints button
document.querySelector(".hints button").addEventListener("click", () => {
  hints(duration);
});

// hints function
function hints(duration) {
  blocks.forEach((block) => {
    block.classList.add("is-flipped");
  });

  setTimeout(() => {
    blocks.forEach((block) => {
      block.classList.remove("is-flipped");
    });
  }, duration);
}

function gameOver() {
  let gameoverDiv = document.createElement("div");
  gameoverDiv.className = "gameover";

  let textSpan1 = document.createElement("span"),
    textSpan2 = document.createElement("span");

  textSpan1.append("Game Over!");
  gameoverDiv.prepend(textSpan1);

  textSpan2.append("Score: ");
  gameoverDiv.appendChild(textSpan2);

  if (parseInt(tries.innerHTML) === 0 && allMatched >= blocks.length / 2)
    gameoverDiv.append(`1000/1000`);
  else if (
    parseInt(tries.innerHTML) >= 0 &&
    parseInt(tries.innerHTML) <= 10 &&
    allMatched <= Math.trunc(blocks.length / 3)
  )
    gameoverDiv.append(`750/1000`);
  else if (
    parseInt(tries.innerHTML) >= 11 &&
    parseInt(tries.innerHTML) <= 20 &&
    allMatched <= Math.trunc(blocks.length / 4)
  )
    gameoverDiv.append(`450/1000`);
  else if (
    parseInt(tries.innerHTML) >= 20 &&
    parseInt(tries.innerHTML) <= 60 &&
    allMatched <= Math.trunc(blocks.length / 5)
  )
    gameoverDiv.append(`250/1000`);
  else if (
    parseInt(tries.innerHTML) >= 61 &&
    parseInt(tries.innerHTML) <= 80 &&
    allMatched <= Math.trunc(blocks.length / 6)
  )
    gameoverDiv.append(`100/1000`);
  else if (
    parseInt(tries.innerHTML) >= 81 &&
    parseInt(tries.innerHTML) <= 100 &&
    allMatched <= Math.trunc(blocks.length / 7)
  )
    gameoverDiv.append(`50/1000`);
  else {
    gameoverDiv.append(`20/1000`);
  }

  let tryAgainBtn = document.createElement("button");
  tryAgainBtn.classList.add("try-again");
  tryAgainBtn.append("Try Again");
  gameoverDiv.appendChild(tryAgainBtn);

  document.body.prepend(gameoverDiv);

  blocksContainer.classList.add("no-click");
}

// handle try-again button
document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("try-again")) {
    document.querySelector(".gameover").remove();
    tries.innerHTML = 0;
    allMatched = 0;

    document.querySelectorAll(".block").forEach((block) => {
      block.classList.remove("is-flipped");
      block.classList.remove("matched");
    });

    blocksContainer.classList.remove("no-click");

    hints(duration + 1500);
    countdown(timer);
    shuffle(orderRange);
  }
});

// handle footer dynamic year
document.querySelector(".year-date").innerHTML = new Date().getFullYear();
