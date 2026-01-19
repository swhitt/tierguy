# TierGuy

A tier list maker app for ranking images. Drag and drop items between tiers to create your perfect tier list.

![TierGuy Example](./docs/example.png)

## Features

- Create and manage multiple tier lists with named saves
- Drag and drop items between tiers with smooth animations
- Reorder tiers by dragging
- Customizable tier colors with color picker
- Dark/light theme toggle
- Export tier list as PNG image
- Auto-save to localStorage
- Mobile responsive layout
- Undo/redo support

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool with HMR
- **Tailwind CSS v4** - Utility-first styling
- **Zustand** - State management
- **@dnd-kit** - Drag and drop
- **html-to-image** - PNG export

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Click "Create New Tier List" to start
2. Add images to the unranked pool
3. Drag items to tiers to rank them
4. Click tier labels to rename, right-click for color picker
5. Use "Saves" to manage multiple tier lists
6. Export as PNG when done

## License

MIT
