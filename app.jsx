import React, { useState, useEffect, useRef } from "react";

// ==================== SHARED COMPONENTS ====================

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Modal({ show, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200">
        {children}
      </div>
    </div>
  );
}

// ==================== EXAMPLE GAME DATA ====================

const exampleGame = {
  title: "Trivia Challenge",
  categories: [
    {
      name: "Space & Astronomy",
      questions: [
        { value: 100, question: "What is the closest planet to the Sun?", answer: "Mercury" },
        { value: 200, question: "How many moons does Mars have?", answer: "Two (Phobos and Deimos)" },
        { value: 300, question: "What is the name of the galaxy that contains our Solar System?", answer: "The Milky Way" },
        { value: 400, question: "What is the term for a dying star that has collapsed into itself?", answer: "Black Hole (or Neutron Star)" },
        { value: 500, question: "How long does it take light from the Sun to reach Earth?", answer: "About 8 minutes (8 minutes 20 seconds)" },
      ],
    },
    {
      name: "Food & Drink",
      questions: [
        { value: 100, question: "What is the main ingredient in hummus?", answer: "Chickpeas" },
        { value: 200, question: "Which country is the origin of the cocktail Mojito?", answer: "Cuba" },
        { value: 300, question: "What type of pasta is shaped like little rice grains?", answer: "Orzo" },
        { value: 400, question: "What is the most expensive spice in the world by weight?", answer: "Saffron" },
        { value: 500, question: "In which country would you find the wine region of Bordeaux?", answer: "France" },
      ],
    },
    {
      name: "World Geography",
      questions: [
        { value: 100, question: "What is the capital of Australia?", answer: "Canberra" },
        { value: 200, question: "Which African country has the largest population?", answer: "Nigeria" },
        { value: 300, question: "What is the smallest country in the world by area?", answer: "Vatican City" },
        { value: 400, question: "Which two countries share the longest international border?", answer: "Canada and USA" },
        { value: 500, question: "What is the only country that borders both the Atlantic and Indian Oceans?", answer: "South Africa" },
      ],
    },
    {
      name: "Science & Nature",
      questions: [
        { value: 100, question: "What does DNA stand for?", answer: "Deoxyribonucleic Acid" },
        { value: 200, question: "What is the largest organ in the human body?", answer: "Skin" },
        { value: 300, question: "What is the most abundant gas in Earth's atmosphere?", answer: "Nitrogen" },
        { value: 400, question: "How many bones are in the adult human body?", answer: "206" },
        { value: 500, question: "What is the speed of light in a vacuum (rounded to nearest thousand)?", answer: "300,000 km/s" },
      ],
    },
    {
      name: "Arts & Literature",
      questions: [
        { value: 100, question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
        { value: 200, question: "Who wrote the play 'Romeo and Juliet'?", answer: "William Shakespeare" },
        { value: 300, question: "What is the longest epic poem in the world?", answer: "The Mahabharata" },
        { value: 400, question: "Which artist is famous for the painting 'The Starry Night'?", answer: "Vincent van Gogh" },
        { value: 500, question: "Who wrote 'One Hundred Years of Solitude'?", answer: "Gabriel García Márquez" },
      ],
    },
  ],
};

// ==================== MAIN APP COMPONENT ====================

const App = () => {
  // ==================== STATE MACHINE ====================
  // States: "MENU" | "BUILDER" | "PLAYER_SETUP" | "PLAYING"
  const [appState, setAppState] = useState("MENU");
  const [activeTab, setActiveTab] = useState("play"); // For menu screen

  // ==================== GAME DATA ====================
  const [currentGame, setCurrentGame] = useState(exampleGame);
  const [builderGame, setBuilderGame] = useState(JSON.parse(JSON.stringify(exampleGame)));

  // ==================== PLAYER SETUP STATE ====================
  const [showPlayerCountModal, setShowPlayerCountModal] = useState(false);
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState([]);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [tempPlayerName, setTempPlayerName] = useState("");

  // ==================== GAME PLAY STATE ====================
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [answeredMap, setAnsweredMap] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // ==================== UI STATE ====================
  const [showCorrectAnim, setShowCorrectAnim] = useState(false);
  const [showWrongAnim, setShowWrongAnim] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showLoadGameModal, setShowLoadGameModal] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);

  // ==================== BUILDER STATE ====================
  const [expandedCategory, setExpandedCategory] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // ==================== REFS ====================
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const loadGameFileInputRef = useRef(null);

  // ==================== EFFECTS ====================

  // Focus input when name modal opens
  useEffect(() => {
    if (showPlayerNameModal && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showPlayerNameModal]);

  // Check for game completion
  useEffect(() => {
    if (appState === "PLAYING" && players.length > 0 && isGameComplete()) {
      setTimeout(() => {
        setShowWinnerModal(true);
      }, 1500);
    }
  }, [answeredMap, appState, players.length]);

  // ==================== GAME LOGIC FUNCTIONS ====================

  const getTotalQuestions = () => {
    return currentGame.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  };

  const isGameComplete = () => {
    return Object.keys(answeredMap).length === getTotalQuestions();
  };

  const getWinners = () => {
    if (players.length === 0) return [];
    const maxScore = Math.max(...players.map((p) => p.score));
    return players.filter((p) => p.score === maxScore);
  };

  // ==================== STATE TRANSITION FUNCTIONS ====================

  /**
   * RESET GAME STATE - Single source of truth for resetting game
   */
  const resetGameState = () => {
    setPlayers([]);
    setCurrentPlayer(0);
    setAnsweredMap({});
    setSelectedQuestion(null);
    setShowAnswer(false);
    setShowWinnerModal(false);
    setShowCorrectAnim(false);
    setShowWrongAnim(false);
  };

  /**
   * LOAD GAME - Replace current game and go to player setup
   */
  const loadGame = (gameData) => {
    setCurrentGame(gameData);
    resetGameState();
    setAppState("PLAYER_SETUP");
    setShowLoadGameModal(false);
    // Open player count modal after state transition
    setTimeout(() => {
      setShowPlayerCountModal(true);
    }, 50);
  };

  /**
   * START PLAYER SETUP - Transition from MENU to PLAYER_SETUP
   */
  const startPlayerSetup = () => {
    resetGameState();
    setAppState("PLAYER_SETUP");
    setShowPlayerCountModal(true);
  };

  /**
   * START GAME - Transition from PLAYER_SETUP to PLAYING
   */
  const startGame = (names) => {
    const newPlayers = names.map((name) => ({ name, score: 0 }));
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setAnsweredMap({});
    setShowWinnerModal(false);
    setSelectedQuestion(null);
    setShowAnswer(false);
    setAppState("PLAYING");
  };

  /**
   * RETURN TO MENU - Go back to menu from any state
   */
  const returnToMenu = () => {
    resetGameState();
    setAppState("MENU");
    setActiveTab("play");
  };

  /**
   * GO TO BUILDER - Switch to builder tab
   */
  const goToBuilder = () => {
    setAppState("BUILDER");
  };

  // ==================== PLAYER SETUP FUNCTIONS ====================

  const handlePlayerCountSubmit = () => {
    if (playerCount < 1 || playerCount > 6) {
      alert("Please enter between 1 and 6 players");
      return;
    }
    setPlayerNames([]);
    setCurrentNameIndex(0);
    setTempPlayerName("");
    setShowPlayerCountModal(false);
    setShowPlayerNameModal(true);
  };

  const handlePlayerNameSubmit = () => {
    if (!tempPlayerName.trim()) {
      alert("Please enter a player name");
      return;
    }

    const newPlayerNames = [...playerNames, tempPlayerName.trim()];
    setPlayerNames(newPlayerNames);
    setTempPlayerName("");

    if (newPlayerNames.length >= playerCount) {
      setShowPlayerNameModal(false);
      startGame(newPlayerNames);
    } else {
      setCurrentNameIndex(currentNameIndex + 1);
    }
  };

  const cancelPlayerSetup = () => {
    setShowPlayerCountModal(false);
    setShowPlayerNameModal(false);
    setPlayerCount(2);
    setPlayerNames([]);
    setCurrentNameIndex(0);
    setTempPlayerName("");
    returnToMenu();
  };

  // ==================== GAME PLAY FUNCTIONS ====================

  const openQuestion = (catName, q) => {
    if (selectedQuestion) return;

    const key = `${catName}-${q.value}`;
    if (answeredMap[key]) return;

    setSelectedQuestion({
      ...q,
      catName,
      key,
      playerIndex: currentPlayer,
    });
    setShowAnswer(false);
  };

  const markAnswer = (correct) => {
    if (!selectedQuestion) return;

    const { key, value, playerIndex } = selectedQuestion;
    const pointChange = correct ? value : -value;

    if (playerIndex < 0 || playerIndex >= players.length) return;

    setAnsweredMap((prev) => ({ ...prev, [key]: true }));

    setPlayers((prevPlayers) => {
      const updated = [...prevPlayers];
      updated[playerIndex] = {
        ...updated[playerIndex],
        score: updated[playerIndex].score + pointChange,
      };
      return updated;
    });

    if (correct) {
      setShowCorrectAnim(true);
      setTimeout(() => setShowCorrectAnim(false), 1200);
    } else {
      setShowWrongAnim(true);
      setTimeout(() => setShowWrongAnim(false), 1200);
    }

    setSelectedQuestion(null);
    setShowAnswer(false);

    setCurrentPlayer((prevPlayer) => {
      if (players.length === 0) return 0;
      return (prevPlayer + 1) % players.length;
    });
  };

  // ==================== FILE HANDLING ====================

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.categories) throw new Error("Invalid format");
        loadGame(parsed);
      } catch {
        alert("Invalid game file. Please upload a valid JSON trivia game.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset file input
  };

  const triggerFileUpload = () => {
    loadGameFileInputRef.current?.click();
  };

  const loadExampleGame = () => {
    loadGame(exampleGame);
  };

  // ==================== BUILDER FUNCTIONS ====================

  const updateBuilderTitle = (newTitle) => {
    setBuilderGame({ ...builderGame, title: newTitle });
  };

  const addCategory = () => {
    const newCategory = {
      name: "New Category",
      questions: [
        { value: 100, question: "", answer: "" },
        { value: 200, question: "", answer: "" },
        { value: 300, question: "", answer: "" },
        { value: 400, question: "", answer: "" },
        { value: 500, question: "", answer: "" },
      ],
    };
    setBuilderGame({
      ...builderGame,
      categories: [...builderGame.categories, newCategory],
    });
  };

  const updateCategoryName = (categoryIndex, newName) => {
    const updated = { ...builderGame };
    updated.categories[categoryIndex].name = newName;
    setBuilderGame(updated);
  };

  const deleteCategory = (categoryIndex) => {
    setCategoryToDelete(categoryIndex);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete === null) return;
    const updated = { ...builderGame };
    updated.categories = updated.categories.filter(
      (_, index) => index !== categoryToDelete
    );
    setBuilderGame(updated);
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const cancelDeleteCategory = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const updateQuestion = (categoryIndex, questionIndex, field, value) => {
    const updated = { ...builderGame };
    updated.categories[categoryIndex].questions[questionIndex][field] = value;
    setBuilderGame(updated);
  };

  const exportGame = () => {
    const dataStr = JSON.stringify(builderGame, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${builderGame.title.replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadBuilderGameToPlay = () => {
    setShowLoadConfirm(true);
  };

  const confirmLoadBuilderGame = () => {
    loadGame(JSON.parse(JSON.stringify(builderGame)));
    setShowLoadConfirm(false);
  };

  const cancelLoadBuilderGame = () => {
    setShowLoadConfirm(false);
  };

  const importToBuilder = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.categories) throw new Error("Invalid format");
        setBuilderGame(parsed);
        alert("Game imported successfully!");
      } catch {
        alert("Invalid game file");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset file input
  };

  // ==================== RENDER FUNCTIONS ====================

  // MENU SCREEN
  if (appState === "MENU") {
    return (
      <>
        {/* Tab Navigation */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
          <div className="flex justify-center gap-1 p-2">
            <button
              onClick={() => setActiveTab("play")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "play"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🎮 Play Game
            </button>
            <button
              onClick={() => {
                setActiveTab("builder");
                goToBuilder();
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "builder"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🔧 Game Builder
            </button>
          </div>
        </div>

        {/* Menu Content */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 gap-6 pt-24">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤔</div>
            <h1 className="text-5xl font-light text-black tracking-tight">
              {currentGame.title}
            </h1>
          </div>
          <div className="flex flex-col gap-4">
            <Button onClick={startPlayerSetup}>
              <span className="flex items-center gap-2 justify-center">
                <span>▶</span> Start with Current Game
              </span>
            </Button>
            <button
              onClick={triggerFileUpload}
              className="px-6 py-3 rounded-lg bg-white text-black font-medium border-2 border-black hover:bg-gray-50 transition-all"
            >
              <span className="flex items-center gap-2 justify-center">
                <span>📂</span> Load Custom Game
              </span>
            </button>
            <button
              onClick={loadExampleGame}
              className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
            >
              <span className="flex items-center gap-2 justify-center">
                <span>✨</span> Load Example Game
              </span>
            </button>
            <input
              ref={loadGameFileInputRef}
              type="file"
              accept=".json"
              hidden
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </>
    );
  }

  // BUILDER SCREEN
  if (appState === "BUILDER") {
    return (
      <>
        {/* Tab Navigation */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
          <div className="flex justify-center gap-1 p-2">
            <button
              onClick={() => {
                setActiveTab("play");
                returnToMenu();
              }}
              className="px-6 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              🎮 Play Game
            </button>
            <button
              className="px-6 py-2 rounded-lg font-medium transition-all bg-black text-white"
            >
              🔧 Game Builder
            </button>
          </div>
        </div>

        <GameBuilder
          builderGame={builderGame}
          updateBuilderTitle={updateBuilderTitle}
          addCategory={addCategory}
          updateCategoryName={updateCategoryName}
          deleteCategory={deleteCategory}
          updateQuestion={updateQuestion}
          exportGame={exportGame}
          loadBuilderGame={loadBuilderGameToPlay}
          importToBuilder={importToBuilder}
        />

        {/* Load Confirmation Modal */}
        <Modal show={showLoadConfirm}>
          <div className="text-center flex flex-col gap-6">
            <div className="text-5xl mb-2">🎮</div>
            <h2 className="text-2xl font-light text-black">Load Game to Play?</h2>
            <p className="text-gray-600">
              This will load your built game and start player setup.
            </p>
            <div className="flex gap-3">
              <Button onClick={confirmLoadBuilderGame} className="flex-1">
                <span className="flex items-center gap-2 justify-center">
                  <span>✓</span> Load & Setup
                </span>
              </Button>
              <button
                onClick={cancelLoadBuilderGame}
                className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-medium border-2 border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Category Confirmation Modal */}
        <Modal show={showDeleteConfirm}>
          <div className="text-center flex flex-col gap-6">
            <div className="text-5xl mb-2">⚠️</div>
            <h2 className="text-2xl font-light text-black">Delete Category?</h2>
            <p className="text-gray-600">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
              >
                <span className="flex items-center gap-2 justify-center">
                  <span>🗑️</span> Delete
                </span>
              </button>
              <button
                onClick={cancelDeleteCategory}
                className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-medium border-2 border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // PLAYER SETUP SCREEN
  if (appState === "PLAYER_SETUP") {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 gap-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤔</div>
            <h1 className="text-5xl font-light text-black tracking-tight">
              {currentGame.title}
            </h1>
            <p className="text-gray-500 mt-4">Setting up players...</p>
          </div>
        </div>

        {/* Player Count Modal */}
        <Modal show={showPlayerCountModal}>
          <div className="text-center flex flex-col gap-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">👥</span>
              <h2 className="text-2xl font-light text-black">
                How many players?
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Enter the number of players (1-6)
            </p>
            <input
              type="number"
              min="1"
              max="6"
              value={playerCount}
              onChange={(e) => setPlayerCount(parseInt(e.target.value) || 1)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:border-black transition-all"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handlePlayerCountSubmit();
                }
              }}
            />
            <div className="flex gap-3">
              <Button onClick={handlePlayerCountSubmit} className="flex-1">
                <span className="flex items-center gap-2 justify-center">
                  <span>✓</span> Next
                </span>
              </Button>
              <button
                onClick={cancelPlayerSetup}
                className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-medium border-2 border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Player Name Modal */}
        <Modal show={showPlayerNameModal}>
          <div className="text-center flex flex-col gap-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">✏️</span>
              <h2 className="text-2xl font-light text-black">
                Enter Player {currentNameIndex + 1} Name
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              {playerNames.length > 0 && (
                <span>Players so far: {playerNames.join(", ")}</span>
              )}
            </p>
            <input
              ref={nameInputRef}
              type="text"
              value={tempPlayerName}
              onChange={(e) => setTempPlayerName(e.target.value)}
              placeholder={`Player ${currentNameIndex + 1}`}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:border-black transition-all"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handlePlayerNameSubmit();
                }
              }}
            />
            <div className="flex gap-3">
              <Button onClick={handlePlayerNameSubmit} className="flex-1">
                <span className="flex items-center gap-2 justify-center">
                  <span>✓</span>{" "}
                  {currentNameIndex + 1 >= playerCount ? "Start Game" : "Next"}
                </span>
              </Button>
              <button
                onClick={cancelPlayerSetup}
                className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-medium border-2 border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // PLAYING SCREEN
  return (
    <div className="min-h-screen bg-white p-8">
      <header className="text-center mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-3xl">🤔</span>
          <h1 className="text-5xl font-light text-black tracking-tight">
            {currentGame.title}
          </h1>
          <span className="text-3xl">🤔</span>
        </div>
        <p className="text-lg text-gray-700 mb-3 flex items-center justify-center gap-2">
          <span className="text-xl">👉</span> Current turn:{" "}
          <span className="font-semibold">{players[currentPlayer]?.name}</span>
        </p>
        <div className="flex justify-center gap-8">
          {players.map((p, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 ${
                i === currentPlayer
                  ? "font-semibold text-black"
                  : "text-gray-500"
              }`}
            >
              <span className="text-lg">
                {i === currentPlayer ? "⭐" : "○"}
              </span>
              <span className="text-base">
                {p.name}: {p.score}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Animations */}
      {showCorrectAnim && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-8xl animate-bounce">🎉</div>
        </div>
      )}
      {showWrongAnim && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-8xl animate-pulse">😢</div>
        </div>
      )}

      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => setShowLoadGameModal(true)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <span>📂</span> Load New Game
        </button>
        <button
          onClick={returnToMenu}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <span>🏠</span> Return to Menu
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 max-w-7xl mx-auto">
        {currentGame.categories.map((cat) => (
          <div key={cat.name} className="flex flex-col gap-3">
            <div className="bg-black text-white text-center py-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
              <span className="text-xs">◆</span>
              {cat.name}
            </div>
            {cat.questions.map((q) => {
              const key = `${cat.name}-${q.value}`;
              const answered = answeredMap[key];
              return (
                <button
                  key={q.value}
                  onClick={() => openQuestion(cat.name, q)}
                  disabled={answered || !!selectedQuestion}
                  className={`h-24 rounded-lg font-semibold text-xl transition-all ${
                    answered
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-white border-2 border-black hover:bg-gray-50"
                  }`}
                >
                  {answered ? "✓" : `${q.value}`}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Question Modal */}
      <Modal show={!!selectedQuestion}>
        {selectedQuestion && (
          <div className="text-center flex flex-col gap-6">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-2">
              <span>❓</span>
              <span>
                QUESTION FOR: {players[selectedQuestion.playerIndex]?.name}
              </span>
              <span>❓</span>
            </div>
            <h2 className="text-2xl font-light text-black leading-relaxed">
              {selectedQuestion.question}
            </h2>
            {selectedQuestion.image && (
              <img
                src={selectedQuestion.image}
                alt="Question"
                className="mx-auto my-4 rounded-xl max-h-64 object-contain"
              />
            )}
            {!showAnswer ? (
              <Button onClick={() => setShowAnswer(true)}>
                <span className="flex items-center gap-2 justify-center">
                  <span>👀</span> Reveal Answer
                </span>
              </Button>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="border-t border-b border-gray-200 py-6">
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mb-3">
                    <span>💡</span>
                    <span>ANSWER</span>
                    <span>💡</span>
                  </div>
                  <p className="text-xl font-medium text-black">
                    {selectedQuestion.answer}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => markAnswer(true)}>
                    <span className="flex items-center gap-2">
                      <span>✅</span> Correct
                    </span>
                  </Button>
                  <button
                    onClick={() => markAnswer(false)}
                    className="px-6 py-3 rounded-lg bg-white text-black font-medium border-2 border-black hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <span>❌</span> Incorrect
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Winner Modal */}
      <Modal show={showWinnerModal}>
        <div className="text-center flex flex-col gap-6">
          <div className="text-7xl mb-2">🏆</div>
          <h2 className="text-3xl font-light text-black">Game Over!</h2>
          {getWinners().length === 1 ? (
            <>
              <p className="text-xl text-gray-700">The winner is...</p>
              <p className="text-4xl font-semibold text-black">
                {getWinners()[0].name}
              </p>
              <p className="text-2xl text-gray-600">
                with {getWinners()[0].score} points! 🎉
              </p>
            </>
          ) : (
            <>
              <p className="text-xl text-gray-700">It's a tie!</p>
              <p className="text-2xl font-semibold text-black">
                {getWinners()
                  .map((w) => w.name)
                  .join(" & ")}
              </p>
              <p className="text-xl text-gray-600">
                both scored {getWinners()[0].score} points! 🎉
              </p>
            </>
          )}
          <div className="border-t border-gray-200 pt-6 mt-4">
            <p className="text-sm text-gray-500 mb-4">Final Scores:</p>
            <div className="flex flex-col gap-2">
              {players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="font-semibold">{p.score} pts</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => setShowLoadGameModal(true)} className="flex-1">
              <span className="flex items-center gap-2 justify-center">
                <span>🎮</span> Load New Game
              </span>
            </Button>
            <button
              onClick={returnToMenu}
              className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-medium border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              <span>🏠</span> Menu
            </button>
          </div>
        </div>
      </Modal>

      {/* Load Game Modal (during gameplay) */}
      <Modal show={showLoadGameModal}>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-2xl">🎮</span>
          <h2 className="text-2xl font-light text-black">Load a New Game</h2>
        </div>
        <p className="text-gray-600 text-sm mb-4 text-center">
          This will end the current game and load a new one.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={loadExampleGame}>
            <span className="flex items-center gap-2 justify-center">
              <span>✨</span> Load Example Game
            </span>
          </Button>
          <button
            onClick={triggerFileUpload}
            className="bg-gray-50 border border-gray-300 px-6 py-3 rounded-lg text-center hover:bg-gray-100 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <span>📄</span> Upload JSON File
          </button>
          <button
            onClick={() => setShowLoadGameModal(false)}
            className="px-6 py-3 rounded-lg bg-white text-black font-medium border border-gray-300 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ==================== GAME BUILDER COMPONENT ====================

function GameBuilder({
  builderGame,
  updateBuilderTitle,
  addCategory,
  updateCategoryName,
  deleteCategory,
  updateQuestion,
  exportGame,
  loadBuilderGame,
  importToBuilder,
}) {
  const [expandedCategory, setExpandedCategory] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔧</span>
              <h1 className="text-3xl font-light text-black">Game Builder</h1>
            </div>
            <div className="flex gap-3">
              <label className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-all flex items-center gap-2">
                <span>📥</span> Import JSON
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={importToBuilder}
                />
              </label>
              <button
                onClick={exportGame}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <span>💾</span> Export JSON
              </button>
              <button
                onClick={loadBuilderGame}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <span>▶</span> Load & Play
              </button>
            </div>
          </div>

          {/* Game Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Title
            </label>
            <input
              type="text"
              value={builderGame.title}
              onChange={(e) => updateBuilderTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-xl font-semibold focus:outline-none focus:border-black transition-all"
              placeholder="Enter game title"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {builderGame.categories.map((cat, catIndex) => (
            <div
              key={catIndex}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === catIndex ? -1 : catIndex
                    )
                  }
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span className="text-xl">
                    {expandedCategory === catIndex ? "▼" : "▶"}
                  </span>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) =>
                      updateCategoryName(catIndex, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent border-b border-gray-600 px-2 py-1 text-lg font-medium focus:outline-none focus:border-white flex-1"
                    placeholder="Category Name"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(catIndex);
                  }}
                  className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-all"
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Questions */}
              {expandedCategory === catIndex && (
                <div className="p-6 space-y-4">
                  {cat.questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-black text-white px-4 py-2 rounded-lg font-bold text-lg min-w-[80px] text-center">
                          ${q.value}
                        </div>
                        <div className="text-sm text-gray-500">
                          Question {qIndex + 1}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Question
                          </label>
                          <textarea
                            value={q.question}
                            onChange={(e) =>
                              updateQuestion(
                                catIndex,
                                qIndex,
                                "question",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                            rows="2"
                            placeholder="Enter question text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Answer
                          </label>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) =>
                              updateQuestion(
                                catIndex,
                                qIndex,
                                "answer",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            placeholder="Enter answer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Category Button */}
        <button
          onClick={addCategory}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-600 font-medium"
        >
          <span className="text-2xl">+</span> Add New Category
        </button>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <span>👀</span> JSON Preview
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
            {JSON.stringify(builderGame, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
