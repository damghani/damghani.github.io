# Number Blocks Learning Adventure

An engaging, self-contained web-based math learning game designed for 1st-2nd grade students. Features interactive number blocks, multiple game modes, adaptive learning, and a comprehensive progression system.

## Features

### 🎮 Game Modes
- **Interactive Block Learning**: Draggable number blocks for hands-on learning
- **Practice Games**: Visual multiple-choice questions with instant feedback
- **Challenge Mode**: Level-based progression with star ratings

### 📚 Math Topics (8 Topics, 84 Levels Total)
1. **Addition** (15 levels) - Add numbers up to 20
2. **Subtraction** (15 levels) - Take away and find differences
3. **Multiplication** (10 levels) - 2x, 5x, and 10x tables
4. **Odd & Even** (8 levels) - Identify odd and even numbers
5. **Number Patterns** (10 levels) - Complete sequences
6. **Division** (8 levels) - Sharing and grouping concepts
7. **Counting** (10 levels) - Count objects from 1-100
8. **Comparing Numbers** (8 levels) - Greater than, less than

### ⭐ Progression System
- Earn 1-3 stars per level based on accuracy
- Unlock new levels by completing previous ones
- Track total stars and daily streaks
- Achievement badges for milestones

### 🎯 Adaptive Learning
- Automatically tracks error patterns
- Identifies weak areas (topics with <70% accuracy)
- Recommends practice for struggling topics
- Detailed progress analytics

### 🎨 Visual Design
- Colorful number blocks inspired by Numberblocks
- Each number (1-20) has a unique color gradient
- Animated confetti for celebrations
- Child-friendly interface with large buttons

### 🔊 Audio & Effects
- Simple sound effects using Web Audio API
- Celebration sounds for correct answers
- Mute toggle available
- All sounds are procedurally generated (no external files)

### ♿ Accessibility
- High contrast mode option
- Reduce motion setting
- Keyboard navigation support
- Large, touch-friendly buttons
- Responsive design for mobile and desktop

## How to Play

### Getting Started
1. Open `index.html` in a web browser
2. Click "Start Learning" from the home screen
3. Choose a topic to practice
4. Select a level (level 1 is always unlocked)
5. Answer questions and earn stars!

### Controls
- **Mouse**: Click and drag blocks, click buttons
- **Touch**: Tap and drag on mobile devices
- **Keyboard**: Tab to navigate, Enter to select

### Earning Stars
- 3 stars ⭐⭐⭐: 90%+ accuracy
- 2 stars ⭐⭐: 70-89% accuracy
- 1 star ⭐: 50-69% accuracy
- 0 stars: Below 50% (level not unlocked)

### Progress Tracking
- All progress is saved automatically in your browser
- View detailed statistics in "View Progress"
- Check recommended practice areas
- Track your daily streak

## File Structure

```
number blocks/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── game.js            # Complete game logic and engine
└── README.md          # This file
```

## Technical Details

### Technologies Used
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, animations, and responsive layout
- **Vanilla JavaScript**: All game logic (no frameworks)
- **Canvas API**: Confetti particle effects
- **LocalStorage**: Progress persistence
- **Web Audio API**: Procedurally generated sounds

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- Smooth 60fps animations
- Fast load time (no external dependencies)
- Efficient canvas rendering
- Optimized for both desktop and mobile

## Customization

### Avatars
Choose from 12 different emoji avatars in Settings:
- 😊 😄 🤓 😎 🥳 🤩
- 😺 🐶 🦁 🐼 🐸 🦊

### Settings Options
- **Sound Effects**: Toggle game sounds
- **Background Music**: (Placeholder for future feature)
- **Animations**: Enable/disable visual effects
- **High Contrast Mode**: Increase contrast for better visibility
- **Reduce Motion**: Minimize animations for accessibility

## Game Mechanics

### Number Blocks
Each number is represented as stacked colored segments:
- **Number 1**: Red (1 segment)
- **Number 2**: Orange (2 segments)
- **Number 3**: Yellow (3 segments)
- **Number 4**: Green (4 segments)
- **Number 5**: Light Blue (5 segments)
- And so on up to 20...

Blocks can be:
- Dragged and dropped (addition/subtraction activities)
- Combined together (addition)
- Split apart (subtraction)
- Grouped (multiplication)
- Shared (division)

### Question Types

#### Addition
- Combine two blocks to find the sum
- Visual representation shows both addends
- Example: "3 + 2 = ?"

#### Subtraction
- Start with larger number, take away smaller
- Visual shows the minuend being reduced
- Example: "5 - 2 = ?"

#### Multiplication
- Groups of equal numbers
- Shows repeated addition visually
- Example: "3 × 2 = ?" (three groups of 2)

#### Division
- Sharing equally among groups
- Visual distribution of objects
- Example: "6 ÷ 2 = ?" (share 6 among 2)

#### Odd & Even
- Identify if a number is odd or even
- Visual pairing shows remainder
- Example: "Is 7 odd or even?"

#### Patterns
- Complete number sequences
- Identify the pattern rule
- Example: "2, 4, 6, 8, ?"

#### Counting
- Count visual objects (stars, shapes)
- Number recognition practice
- Example: "How many stars are there?"

#### Comparing
- Determine greater than or less than
- Number line visualization
- Example: "7 ___ 5" (>, <, or =)

## Level Progression

### Easy Levels (1-5)
- Single-digit operations
- Prominent visual aids
- Multiple choice with images
- No time pressure

### Medium Levels (6-10)
- Mix of single and double digits
- Reduced visual scaffolding
- Some fill-in-the-blank
- Optional gentle timer

### Challenge Levels (11-15+)
- Mixed operations
- Simple word problems
- Less scaffolding
- Achievement unlocks

## Adaptive Learning System

### How It Works
1. **Error Tracking**: Records incorrect answers by topic
2. **Accuracy Calculation**: Computes success rate per topic
3. **Weak Area Detection**: Identifies topics below 70% accuracy
4. **Smart Recommendations**: Suggests focused practice
5. **Progress Visualization**: Shows improvement over time

### Weak Area Indicators
- Red highlight for topics needing practice
- Accuracy percentage displayed
- Quick "Practice" button for targeted review
- Encouragement rather than punishment

### Analytics Dashboard
Parents and teachers can view:
- Total stars earned
- Topics mastered
- Daily streak
- Accuracy per topic
- Recommended focus areas

## Storage & Privacy

### What's Saved
- Total stars earned
- Level completion status
- Star ratings per level
- Daily streak counter
- Game settings preferences
- Error patterns (for adaptive learning)

### Where It's Saved
- All data stored locally in browser's LocalStorage
- No data sent to external servers
- No personal information collected
- Data persists between sessions
- Can be reset via Settings

### Data Management
- Reset all progress: Settings → "Reset All Progress"
- Clear browser data to completely remove all game data
- Export/import features can be added in future

## Educational Best Practices

### Pedagogy Principles
- **Immediate Feedback**: Instant visual/audio confirmation
- **No Penalties**: Wrong answers are learning opportunities
- **Scaffolded Difficulty**: Gradual progression in complexity
- **Multiple Representations**: Visual + numeric + interactive
- **Short Sessions**: 5-10 minute practice sessions
- **Intrinsic Motivation**: Stars, badges, and achievements
- **Mastery-Based**: Must complete levels to unlock next

### Learning Theory
- **Constructivism**: Hands-on manipulation of blocks
- **Spiral Curriculum**: Topics revisited with increasing depth
- **Differentiation**: Adaptive learning adjusts to student needs
- **Gamification**: Engagement through game mechanics
- **Visual Learning**: Strong emphasis on visual representations

## Troubleshooting

### Game won't load
- Ensure JavaScript is enabled in browser
- Try a different browser (Chrome recommended)
- Check browser console for errors (F12)

### Progress not saving
- Check if browser allows LocalStorage
- Ensure not in Incognito/Private mode
- Try clearing cache and reloading

### Animations are laggy
- Enable "Reduce Motion" in Settings
- Close other browser tabs
- Update browser to latest version
- Try on a different device

### Touch controls not working
- Ensure touch screen is clean
- Try refreshing the page
- Update mobile browser
- Check device compatibility

## Future Enhancements

### Potential Features
- [ ] More math topics (time, money, shapes, fractions)
- [ ] Multiplayer mode for siblings/classmates
- [ ] Printable worksheets
- [ ] Detailed parent reports (PDF export)
- [ ] More avatar customization options
- [ ] Background theme selection
- [ ] Timed challenge mode
- [ ] Leaderboards (local only)
- [ ] Interactive lessons before practice
- [ ] More block manipulation activities
- [ ] Word problem scenarios
- [ ] Integration with school curricula

### Suggested Improvements
- Add more granular difficulty settings
- Implement spaced repetition algorithm
- Create tutorial mode for new users
- Add hints system for struggling students
- Implement reward/unlock system for avatars
- Create certificate printing feature
- Add "play with friend" mode

## Development Notes

### Code Structure
- **GameState**: Manages game state and progress
- **QuestionGenerator**: Creates math problems dynamically
- **NumberBlock**: Interactive draggable block component
- **UIManager**: Handles all UI rendering and screens
- **Confetti System**: Canvas-based particle animation

### Extensibility
The code is organized for easy expansion:
- Add new topics by extending `TOPICS` object
- Create new question types in `QuestionGenerator`
- Add new screens by following existing pattern
- Extend achievement system in `renderAchievements`

### Performance Optimization
- Debounced drag events
- Efficient canvas clearing
- Minimal DOM manipulation
- CSS transforms for animations
- LocalStorage batch updates

## Credits

### Inspiration
- **Numberblocks**: BBC educational program
- **Khan Academy Kids**: Gamified learning approach
- **Prodigy Math**: Adaptive learning system

### Design
- Color palette inspired by rainbow progression
- Child-friendly typography and spacing
- Material Design elevation and shadows
- Accessible color contrast ratios (WCAG AA)

## License

This is an educational project created for learning purposes. Feel free to use, modify, and distribute as needed for educational purposes.

## Support

For issues, suggestions, or feedback:
1. Check the Troubleshooting section above
2. Review the browser console for errors
3. Test in a different browser
4. Ensure all files are in the same directory

## Version History

### v1.0.0 (Current)
- Initial release
- 8 math topics with 84 total levels
- Interactive number blocks
- Adaptive learning system
- Progress tracking and achievements
- Confetti animations and sound effects
- Responsive design for mobile/desktop
- Accessibility features

---

**Have fun learning math! 🎉📚⭐**
