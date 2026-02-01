# 🎮 Sandbox Hangman

A minimalist, high-fidelity Hangman game designed specifically for local co-op play on mobile devices. Built with a focus on smooth animations, "iOS Vibe" aesthetics, and full support for the Turkish alphabet.

## 🚀 The Story
This project was born out of a desire for a digital "paper and pencil" experience. Instead of the game picking a word from a pre-defined list, **Sandbox Hangman** allows a player (the "Host") to manually set the board for another player (the "Guesser"). This makes it the perfect companion for a couple playing together on a single phone.

The app was built using **Vite + React** and leverages **Framer Motion** for a premium, responsive feel. It was designed and developed through an agentic AI workflow (OpenClaw + Google Antigravity).

## ✨ Key Features
- **Sandbox Mode:** Manually select word length (1-15 characters) and reveal letters as they are guessed.
- **Turkish Support:** A custom-built virtual keyboard includes all Turkish specific characters (`Ğ, Ü, Ş, İ, Ö, Ç`).
- **iOS Inspired UI:** A clean, light-mode design with fluid layouts that fit perfectly on iPhone screens.
- **Interactive Hangman:** A minimalist SVG hangman that draws itself part-by-part as mistakes are made.
- **Mistake Management:** Mistakenly placed a letter? Just tap a filled blank or a graveyard letter to remove it.

## 🕹️ How to Play
1. **Setup:** The first player chooses a word in their head and taps the corresponding number of letters on the setup screen.
2. **Guessing:** The second player calls out a letter.
3. **Action:**
   - If the letter is **correct**, the Host taps the letter on the keyboard, selects the correct empty space on the board, and hits **✓**.
   - If the letter is **incorrect**, the Host taps the letter on the keyboard and hits **✕** to send it to the "Graveyard."
4. **Winning/Losing:** The game ends when the word is fully revealed (Win) or when the 6th limb of the hangman is drawn (Loss).
5. **Correction:** If a letter is placed incorrectly, simply tap that letter on the board or in the graveyard to clear it.

## 🛠️ Built With
- **Framework:** React
- **Build Tool:** Vite
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** GitHub Pages

---
*Created by Kaira 🌌 for Derin.*
