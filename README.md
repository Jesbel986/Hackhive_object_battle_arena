# Object Battle Arena 🎯⚔️

> **Take a photo. Turn it into a fighter. Push your opponent out.**
>
> Because apparently your mug, shoe and water bottle needed a fighting career. 😂

---

## Basic Details

### Team Name

**HackHive 🐝**

### Team Members

* **Team Lead:** Jesbel Ts — Christ College of Engineering
* **Member 2:** Meryl Grace Jiju — Christ College of Engineering

---

## Project Description

**Object Battle Arena** is a camera- and microphone-powered arcade game that transforms ordinary everyday objects into unique fighters.

Players can capture an object using their camera and bring it into a virtual battle arena. Two fighters then compete inside a circular arena, where the goal is simple:

> **Stay inside the circle. Push the opponent out.**

Instead of traditional health bars and complicated fighting controls, the game focuses on physics-based knockback, simple controls, animations, sound effects, and microphone-powered attacks.

A mug can fight a bottle.
A shoe can fight a keyboard.
And nobody knows why. 😂

That's exactly the point.

---

# The Problem (that doesn't exist) 🤡

People have been living with a serious problem for far too long:

**Everyday objects don't fight each other.**

A mug just sits there.

A shoe just gets worn.

A bottle just holds water.

A keyboard just gets used for typing.

Clearly, something had to be done.

There was also an alarming lack of technology answering the most important question of our generation:

> **"Can my mug beat your bottle?"**

So we decided to solve this completely unnecessary problem.

---

# The Solution (that nobody asked for) 💀

We built **Object Battle Arena**.

Our system takes an ordinary object, captures it through a camera, turns it into a virtual fighter, places it inside a dramatic battle arena, and lets it fight another object.

And because simply fighting wasn't useless enough...

**we added a microphone.** 🎤

Players can literally shout at their opponent to generate knockback.

So instead of:

> "Please move."

You can now technologically scream at a virtual bottle.

### The entire system exists to answer one question:

**Which random household object is stronger?**

---

# 🎮 How It Works

## 1. 📸 Scan an Object

The player uses the camera to capture an everyday object.

Examples include:

* ☕ Mug
* 👟 Shoe
* 🍼 Bottle
* ⌨️ Keyboard
* 📖 Book
* 📎 Stapler
* 🪑 Chair
* 🧸 Toy
* 🎒 Backpack
* 🥤 Water bottle

The environment itself becomes the character selection screen.

---

## 2. 🧍 Create Your Fighter

The captured object is transformed into a game character.

Instead of simply displaying the original photograph, the object becomes part of the fighter's visual identity.

For example:

**Mug → Mugzilla ☕**

**Bottle → Hydro Boss 🍼**

**Shoe → Sole Destroyer 👟**

The game gives ordinary objects an unnecessarily dramatic fighting identity.

---

## 3. 🎬 Fighter Introduction

Before the battle begins, the fighters are introduced like serious arcade competitors.

### ROUND 01

**RUBY RUMBLER**

**VS**

**AZURE ATTACKER**

Then:

### 3...

### 2...

### 1...

# FIGHT! 🔥

The dramatic presentation makes the ridiculous battle even funnier.

---

# ⭕ The Circular Arena

The main battlefield is a circular arena.

There is **no traditional "reduce the enemy's HP to zero" objective.**

Instead:

> **PUSH YOUR OPPONENT OUT OF THE CIRCLE.**

Both fighters begin inside the arena.

Attacks apply knockback force to the opponent.

Players must:

**Position → Push → Knockback → Recover → Counterattack → Survive**

A fighter who crosses the arena boundary is eliminated.

The remaining fighter wins.

---

# 👊 Push Attack

The primary attack is **PUSH**.

When activated, the fighter attacks the opponent and applies knockback force.

A successful attack can trigger:

* 💥 Impact effects
* 💨 Knockback
* ✨ Particles
* 📳 Screen shake
* 🔊 Sound effects
* 🎬 Attack animations
* ⚡ Arena effects

Normal attacks should not instantly eliminate a fighter.

Players need to strategically push their opponent toward the edge.

---

# 🎤 Shout Attack

The most ridiculous feature of Object Battle Arena is the **SHOUT attack**.

The game uses microphone input to measure the player's voice volume.

The louder the player shouts, the stronger the knockback.

### Example

**Quiet voice**

→ Small push

**Normal voice**

→ Medium push

**Loud shout**

→ Strong push

**Absolutely unnecessary screaming**

→ MASSIVE PUSH 💀

The game displays a live microphone power indicator:

```text
🎤 MAKE SOME NOISE!

POWER: 87%

💥
```

The measured audio intensity is converted into attack strength and applied to the opponent.

So technically:

> **Audio amplitude → Attack power → Knockback → Possible elimination**

Or, less technically:

> **Scream at the bottle.**

---

# ⚙️ Physics-Based Gameplay

The battle uses a lightweight physics system to control:

* Player position
* Velocity
* Knockback
* Movement
* Friction
* Damping
* Arena boundary detection

When an attack connects:

```text
Attack Strength
       ↓
Knockback Force
       ↓
Player Movement
       ↓
Position Changes
       ↓
Arena Boundary
       ↓
Victory / Elimination
```

This makes the result of each attack visually understandable.

---

# 🤖 Battle Experience

The game is designed to be instantly understandable.

A player should be able to understand the game within seconds:

> **Two characters.**

> **One circle.**

> **Push the other character out.**

> **One attack.**

> **One attack powered by your voice.**

This makes the game suitable for quick demonstrations at hackathons, where judges and visitors may only have a short time to interact with the project.

---

# 🧠 Technology & Concepts Used

### Software

* **JavaScript** — Gameplay logic and interactions
* **React** — Interactive user interface and game state management
* **CSS** — Visual design, animations and responsive interface
* **Camera/Web APIs** — Capturing objects through the device camera
* **Microphone/Web Audio APIs** — Measuring microphone volume for the Shout attack
* **Game Physics** — Knockback, movement, velocity and arena-boundary detection
* **Animation** — Character movement, attacks, transitions and battle effects

---

# 🔄 Game Workflow

```text
        START
          │
          ▼
   Enter the Arena
          │
          ▼
    Capture Object
          │
          ▼
   Process the Image
          │
          ▼
    Create Fighter
          │
          ▼
  Fighter Introduction
          │
          ▼
      3  2  1  FIGHT!
          │
          ▼
    ┌───────────────┐
    │  PUSH ATTACK  │
    │      +        │
    │ SHOUT ATTACK  │
    └───────────────┘
          │
          ▼
     Knockback
          │
          ▼
   Is player outside
      the circle?
       /       \
     NO         YES
     │           │
     ▼           ▼
 Continue      Defeat
   Fight          │
                  ▼
               Winner
```

---

# 📸 Screenshots

> Replace the placeholders below with screenshots of your actual application.

### Landing Page

![Landing Page](screenshots/landing-page.png)

*The landing screen introduces the concept of Object Battle Arena and allows the player to enter the game.*

### Object Capture

![Object Capture](screenshots/object-capture.png)

*The camera interface allows players to capture an everyday object and turn it into a fighter.*

### Fighter Selection

![Fighter Selection](screenshots/fighter-selection.png)

*The player previews their generated fighter before entering the arena.*

### Battle Arena

![Battle Arena](screenshots/battle-arena.png)

*Two fighters compete inside the circular arena using push and microphone-powered attacks.*

### Victory Screen

![Victory Screen](screenshots/victory-screen.png)

*The winning fighter is revealed after pushing the opponent outside the arena.*

---

# 🎥 Project Demo

## Video

**Demo Video:**
[Add your demo video link here]

The demonstration showcases:

* Object capture
* Fighter creation
* Character introduction
* Circular arena
* Push attack
* Microphone-powered Shout attack
* Knockback physics
* Victory condition

---

# 🔮 Future Scope

Object Battle Arena can be extended with additional ridiculous features in the future.

### 👥 Real-Time Multiplayer

Allow two players to connect remotely and battle using their own photographed fighters.

### 🧠 Smarter Fighter Generation

Automatically generate:

* Funny fighter names
* Unique personalities
* Character-specific abilities
* Attack animations
* Special moves
* Voice lines

based on the photographed object.

### ⚔️ Character-Specific Abilities

A bottle, shoe, keyboard and mug could each have completely different abilities.

For example:

**Bottle**

> 💦 Flood Blast

**Shoe**

> 👟 Mega Slap

**Keyboard**

> ⌨️ Ctrl + Alt + Destroy

**Mug**

> ☕ Caffeine Rage

### 🏆 Global Leaderboards

Track:

* Wins
* Knockouts
* Win streaks
* Battles played
* Shout power
* Most chaotic fighter

### 😂 Random Events

Add completely unnecessary events such as:

* Random chickens entering the arena
* Banana slips
* Giant objects falling from the sky
* Random air horns
* Temporary slippery floors
* Unexpected self-knockouts

Because the game clearly isn't useless enough yet.

---

# 😂 Why Is This Project Useless?

A mug was created to hold coffee.

A shoe was created to protect your feet.

A keyboard was created for typing.

A bottle was created to hold water.

We ignored all of that.

Instead, we gave them:

**physics,**

**knockback,**

**microphone-powered attacks,**

**dramatic introductions,**

**sound effects,**

**animations,**

and an arena.

All to determine:

# ☕ VS 🍼

**WHO GETS PUSHED OUT FIRST?**

That's the entire point.

The project takes an absurdly simple and completely unnecessary idea and implements it with real interactive technology.

---

# 👥 Team Contributions

### Jesbel Ts — Team Lead | Frontend & Integration

* Developed and integrated the React frontend
* Connected the different game screens and navigation flow
* Integrated object/image capture into the game
* Implemented fighter selection and character display
* Integrated gameplay controls with the game logic
* Added visual effects, transitions and interactive elements
* Assisted with testing, debugging and final integration

### Meryl Grace Jiju — UI/UX & Visual Design

* Designed the overall visual identity of Object Battle Arena
* Created the landing page and player/object selection interfaces
* Designed the battle arena layout and player HUD
* Worked on character presentation and animations
* Designed the Red vs Blue player selection experience
* Created the victory and result-screen concepts
* Improved responsiveness and overall user experience

---

# 🚀 Installation & Running Locally

## Prerequisites

Make sure you have:

* Node.js installed
* npm installed
* A modern web browser
* A device with camera/microphone access for the full experience

## Installation

Clone the repository:

```bash
git clone <your-github-repository-url>
```

Navigate into the project:

```bash
cd object-battle-arena
```

Install dependencies:

```bash
npm install
```

## Run the Development Server

```bash
npm run dev
```

Open the local URL shown in your terminal, usually:

```text
http://localhost:5173
```

Allow camera and microphone permissions when prompted.

---

# 📦 Build for Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# 🏁 Project Status

### Current

* ✅ Interactive game interface
* ✅ Object/photo capture
* ✅ Fighter creation
* ✅ Circular battle arena
* ✅ Push-based knockback gameplay
* ✅ Microphone-powered Shout attack
* ✅ Animations and visual effects
* ✅ Bot battle experience

### Future

* 🔮 Real-time remote multiplayer
* 🔮 More object-specific abilities
* 🔮 Advanced character generation
* 🔮 Global leaderboard
* 🔮 More battle animations and random events

---

## Made with ❤️ at TinkerHub Useless Projects

![TinkerHub](https://img.shields.io/badge/TinkerHub-24?color=%23000000\&link=https%3A%2F%2Fwww.tinkerhub.org%2F)

![UselessProjects](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless--projects--3.0)

---

# 🐝 HackHive

### "Turning ordinary objects into unnecessarily competitive fighters."

**Object Battle Arena — because your belongings deserve a fighting career.** 😂




