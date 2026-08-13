/* =====================================================
   CRAPS GAME
   EVEN / ODD BETTING
   ===================================================== */

(function () {

    "use strict";


    /* =================================================
       GAME SETTINGS
       ================================================= */

    const STARTING_BALANCE = 1000;

    const BET_AMOUNT = 100;


    /* =================================================
       GAME VARIABLES
       ================================================= */

    let balance = STARTING_BALANCE;

    let selectedBet = null;

    let gameActive = true;

    let rolling = false;

    let roundNumber = 0;


    /* =================================================
       HTML ELEMENTS
       ================================================= */

    const game =
        document.getElementById(
            "craps-game"
        );

    const balanceDisplay =
        document.getElementById(
            "craps-balance"
        );

    const statusDisplay =
        document.getElementById(
            "craps-status"
        );

    const totalDisplay =
        document.getElementById(
            "craps-total"
        );

    const messageDisplay =
        document.getElementById(
            "craps-message"
        );

    const historyDisplay =
        document.getElementById(
            "craps-history"
        );

    const evenButton =
        document.getElementById(
            "craps-even-btn"
        );

    const oddButton =
        document.getElementById(
            "craps-odd-btn"
        );

    const rollButton =
        document.getElementById(
            "craps-roll-btn"
        );

    const exitButton =
        document.getElementById(
            "craps-exit-btn"
        );

    const dieOne =
        document.getElementById(
            "craps-die-1"
        );

    const dieTwo =
        document.getElementById(
            "craps-die-2"
        );


    /* =================================================
       SAFETY CHECK
       ================================================= */

    if (
        !game ||
        !balanceDisplay ||
        !statusDisplay ||
        !totalDisplay ||
        !messageDisplay ||
        !historyDisplay ||
        !evenButton ||
        !oddButton ||
        !rollButton ||
        !exitButton ||
        !dieOne ||
        !dieTwo
    ) {
        return;
    }


    /* =================================================
       UPDATE BALANCE
       ================================================= */

    function updateBalance() {

        balanceDisplay.textContent =
            "$" +
            balance.toLocaleString();

    }


    /* =================================================
       SELECT EVEN / ODD
       ================================================= */

    function selectBet(choice) {

        if (
            !gameActive ||
            rolling
        ) {
            return;
        }


        selectedBet = choice;


        evenButton.classList.remove(
            "selected"
        );

        oddButton.classList.remove(
            "selected"
        );


        if (choice === "even") {

            evenButton.classList.add(
                "selected"
            );

        }


        if (choice === "odd") {

            oddButton.classList.add(
                "selected"
            );

        }


        statusDisplay.textContent =
            "You selected " +
            choice.toUpperCase() +
            ". Now roll the dice.";


        messageDisplay.textContent = "";

        messageDisplay.className =
            "craps-message";
    }


    /* =================================================
       ROLL ONE DIE
       ================================================= */

    function rollDie() {

        return Math.floor(
            Math.random() * 6
        ) + 1;

    }


    /* =================================================
       DISPLAY DIE VALUE
       ================================================= */

    function showDieValue(
        die,
        value
    ) {

        const front =
            die.querySelector(
                ".front"
            );

        if (front) {

            front.textContent =
                value;

        }

        die.dataset.value =
            value;
    }


    /* =================================================
       DICE ANIMATION
       ================================================= */

    function animateDice(
        callback
    ) {

        rolling = true;

        rollButton.disabled = true;

        evenButton.disabled = true;

        oddButton.disabled = true;


        dieOne.classList.remove(
            "rolling"
        );

        dieTwo.classList.remove(
            "rolling"
        );


        /*
         * Force browser reflow.
         * This allows the animation
         * to restart on every roll.
         */

        void dieOne.offsetWidth;

        void dieTwo.offsetWidth;


        dieOne.classList.add(
            "rolling"
        );

        dieTwo.classList.add(
            "rolling"
        );


        setTimeout(
            function () {

                dieOne.classList.remove(
                    "rolling"
                );

                dieTwo.classList.remove(
                    "rolling"
                );


                rolling = false;


                if (gameActive) {

                    rollButton.disabled =
                        false;

                    evenButton.disabled =
                        false;

                    oddButton.disabled =
                        false;
                }


                callback();

            },
            1000
        );
    }


    /* =================================================
       ADD HISTORY
       ================================================= */

    function addHistory(
        round,
        die1,
        die2,
        total,
        choice,
        result,
        newBalance
    ) {

        const empty =
            historyDisplay.querySelector(
                ".craps-empty-history"
            );


        if (empty) {

            empty.remove();

        }


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "craps-history-row " +
            (
                result === "WIN"
                    ? "win"
                    : "loss"
            );


        row.innerHTML = `
            <span>#${round}</span>

            <span>
                🎲 ${die1} + ${die2} = ${total}
            </span>

            <span>
                ${choice.toUpperCase()}
            </span>

            <span>
                ${result} —
                $${newBalance.toLocaleString()}
            </span>
        `;


        historyDisplay.prepend(
            row
        );
    }


    /* =================================================
       PLAY ROUND
       ================================================= */

    function playRound() {

        if (
            !gameActive ||
            rolling
        ) {
            return;
        }


        /* No bet selected */

        if (!selectedBet) {

            statusDisplay.textContent =
                "Please choose EVEN or ODD first.";

            messageDisplay.textContent =
                "Select EVEN or ODD before rolling.";

            messageDisplay.className =
                "craps-message info";

            return;
        }


        /* Not enough money */

        if (
            balance <
            BET_AMOUNT
        ) {

            endGame(
                "💰 You do not have enough money to place another $100 bet."
            );

            return;
        }


        /*
         * Remove the $100 stake.
         */

        balance -=
            BET_AMOUNT;


        updateBalance();


        statusDisplay.textContent =
            "Rolling the dice...";


        messageDisplay.textContent = "";


        animateDice(
            function () {

                /* Roll dice */

                const die1 =
                    rollDie();

                const die2 =
                    rollDie();


                /* Calculate total */

                const total =
                    die1 + die2;


                /* Determine EVEN / ODD */

                const result =
                    total % 2 === 0
                        ? "even"
                        : "odd";


                /* Check prediction */

                const won =
                    selectedBet ===
                    result;


                roundNumber++;


                /*
                 * Display dice.
                 */

                showDieValue(
                    dieOne,
                    die1
                );

                showDieValue(
                    dieTwo,
                    die2
                );


                totalDisplay.textContent =
                    total;


                /* ==========================
                   WIN
                   ========================== */

                if (won) {

                    /*
                     * Return the $100 stake
                     * and give $100 winnings.
                     */

                    balance +=
                        BET_AMOUNT * 2;


                    messageDisplay.textContent =
                        "🎉 YOU WIN! The total is " +
                        result.toUpperCase() +
                        ". You won $100.";


                    messageDisplay.className =
                        "craps-message win";

                }


                /* ==========================
                   LOSS
                   ========================== */

                else {

                    messageDisplay.textContent =
                        "❌ YOU LOSE! The total is " +
                        result.toUpperCase() +
                        ". You lost $100.";


                    messageDisplay.className =
                        "craps-message loss";
                }


                updateBalance();


                /* Save round history */

                addHistory(
                    roundNumber,
                    die1,
                    die2,
                    total,
                    selectedBet,
                    won
                        ? "WIN"
                        : "LOSS",
                    balance
                );


                /*
                 * Reset selected bet.
                 */

                selectedBet =
                    null;


                evenButton.classList.remove(
                    "selected"
                );

                oddButton.classList.remove(
                    "selected"
                );


                /*
                 * Check Game Over.
                 */

                if (
                    balance <= 0
                ) {

                    endGame(
                        "💰 You have run out of money. Game Over!"
                    );

                }

                else {

                    statusDisplay.textContent =
                        "Round complete. Choose EVEN or ODD for the next round.";

                    rollButton.disabled =
                        false;

                    evenButton.disabled =
                        false;

                    oddButton.disabled =
                        false;
                }

            }
        );
    }


    /* =================================================
       EXIT GAME
       ================================================= */

    function exitGame() {

        if (
            !gameActive ||
            rolling
        ) {
            return;
        }


        endGame(
            "You exited the game with $" +
            balance.toLocaleString() +
            ". Thanks for playing!"
        );
    }


    /* =================================================
       GAME OVER
       ================================================= */

    function endGame(
        reason
    ) {

        gameActive =
            false;

        rolling =
            false;


        rollButton.disabled =
            true;

        evenButton.disabled =
            true;

        oddButton.disabled =
            true;

        exitButton.disabled =
            true;


        game.classList.add(
            "game-over"
        );


        statusDisplay.textContent =
            "GAME OVER";


        messageDisplay.textContent =
            reason;


        messageDisplay.className =
            "craps-message info";
    }


    /* =================================================
       BUTTON EVENTS
       ================================================= */

    evenButton.addEventListener(
        "click",
        function () {

            selectBet("even");

        }
    );


    oddButton.addEventListener(
        "click",
        function () {

            selectBet("odd");

        }
    );


    rollButton.addEventListener(
        "click",
        playRound
    );


    exitButton.addEventListener(
        "click",
        exitGame
    );


    /* =================================================
       INITIALIZE GAME
       ================================================= */

    updateBalance();

    totalDisplay.textContent =
        "—";

})();

