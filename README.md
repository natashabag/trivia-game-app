# 🤔 Trivia Game - Interactive Trivia Builder & Player

A fully-featured trivia game application with a custom game builder. Create your own trivia games or play with pre-made questions!

## ✨ Features

- **🎮 Play Mode**: Play trivia games with multiple players, track scores, and declare winners
- **🔧 Game Builder**: Create custom trivia games with categories and questions
- **💾 Import/Export**: Save and share your trivia games as JSON files
- **👥 Multiplayer**: Support for 1-6 players with turn-based gameplay
- **📊 Score Tracking**: Real-time score updates and winner announcements
- **🎨 Clean UI**: Modern, responsive design with smooth animations

## 🚀 Quick Start

### Run Locally

1. Clone this repository
2. Open `index.html` in your web browser
3. Start playing or building your own trivia game!

## 📖 How to Use

### Playing a Game

1. Click "Start with Current Game" on the main menu
2. Enter the number of players (1-6)
3. Enter each player's name
4. Click questions to reveal them
5. Reveal answers and mark correct/incorrect
6. The game automatically tracks scores and declares a winner!

### Building a Custom Game

1. Click the "🔧 Game Builder" tab
2. Edit the game title
3. Add categories and questions
4. Set point values for each question
5. Export as JSON to save your game
6. Click "Load & Play" to test your game immediately

### Importing Games

- Click "Load Custom Game" on the main menu
- Select a JSON file with your trivia game
- The game structure should follow this format:

```json
{
  "title": "Your Game Title",
  "categories": [
    {
      "name": "Category Name",
      "questions": [
        {
          "value": 100,
          "question": "Your question here?",
          "answer": "Your answer here"
        }
      ]
    }
  ]
}
```

## 🎯 Game Rules

- Players take turns selecting questions
- Questions are worth their displayed point value
- Correct answers add points, incorrect answers subtract points
- Each question can only be answered once
- The player (or players in case of a tie) with the highest score wins!

## 🛠️ Technology Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Vanilla JavaScript** - No build tools required

## 📦 Deploying to GitHub Pages

1. Fork or clone this repository
2. Go to repository Settings → Pages
3. Set Source to "main" branch and "/" root folder
4. Click Save
5. Your app will be live at `https://YOUR-USERNAME.github.io/trivia-game-app/`

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Add new example games
- Improve the UI/UX
- Add new features (timers, sound effects, etc.)
- Fix bugs

## 📝 License

MIT License - feel free to use this for personal or commercial projects!

## 🎉 Credits

Built with React and ❤️ by the community.

---

**Have fun creating and playing trivia games!** 🎮✨
