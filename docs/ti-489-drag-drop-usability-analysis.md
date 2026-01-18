# ti-489: Drag-Drop Usability Analysis

## Executive Summary

The current drag-drop implementation uses dnd-kit but underutilizes it. The biggest usability gap: **users cannot control where items land within a tier**. Items always append to the end, regardless of where the user drops them.

## Current Architecture

- **Library**: dnd-kit v6.3.1 core + v10.0.0 sortable (sortable unused)
- **Pattern**: Basic `useDraggable`/`useDroppable` hooks only
- **Sensors**: PointerSensor (8px), TouchSensor (200ms delay), KeyboardSensor

```
TierListView (DndContext)
├── TierRow[] (useDroppable) → DraggableItem[]
├── UnrankedPool (useDroppable) → DraggableItem[]
└── DragOverlay (preview)
```

## Critical Issues

### 1. No Position Control (High Impact)

**Problem**: `handleDragEnd` always places items at the end:
```typescript
// TierListView.tsx:109
moveItem(itemId, targetTierId, targetItems.length)  // always appends
```

**User expectation**: Drop between items 2 and 3 → item lands between 2 and 3.
**Actual behavior**: Drop anywhere → item lands at end.

**Fix**: Implement `SortableContext` from @dnd-kit/sortable (already installed but unused).

### 2. No Drop Position Indicator (High Impact)

**Problem**: No visual feedback showing where item will land.

- TierRow shows blue highlight when hovering (good)
- No indicator showing insert position (bad)
- User has no idea if drop lands at start, middle, or end

**Fix**: Add insertion line indicator at calculated drop position.

### 3. Touch Delay May Feel Sluggish (Medium Impact)

**Current**: 200ms delay before drag initiates on touch devices.

**Tradeoff**:
- Prevents accidental drags during scroll (good)
- Feels slower than native apps (bad)
- Competitors: 150ms is common for touch-optimized drag

**Recommendation**: Test 150ms. If accidental drags increase, revert.

### 4. Inconsistent Keyboard Behavior (Low Impact)

**Current**:
- Delete/Backspace removes unranked items only
- Tier items require modal to delete

**Why inconsistent**: Items in tiers feel "committed" so deletion requires confirmation. Makes sense, but not discoverable.

**Recommendation**: Either add keyboard delete confirmation modal for tier items, or document the intentional difference in onboarding.

## Design Observations

### What Works

1. **Drag handle pattern**: Prevents accidental selection on desktop, shows on touch devices
2. **Visual drag state**: 50% opacity + 105% scale clearly shows item in motion
3. **Separate file drag system**: Native HTML5 for files doesn't conflict with dnd-kit
4. **DragOverlay**: Smooth preview follows cursor

### What Could Improve

1. **No tier distinction visually**: S-tier and D-tier drop zones look identical
2. **Drag handle hidden on desktop**: Relies on grab cursor change, less discoverable
3. **No undo for moves**: Store has past/future arrays but no exposed undo action

## Recommended Changes

### Must Have (addresses core usability)

1. **Implement SortableContext** for within-tier reordering
2. **Add drop position tracking** via collision detection
3. **Add insertion indicator** (vertical line at drop position)

### Should Have (improves polish)

4. **Test touch delay at 150ms** instead of 200ms
5. **Add undo button** for accidental moves

### Nice to Have

6. **Multi-select drag** (shift-click to select range)
7. **Keyboard navigation** within tiers (arrow keys to move items)

## Implementation Notes

### SortableContext Integration

The `@dnd-kit/sortable` package is already installed. Key changes:

1. Wrap item lists in `<SortableContext items={ids} strategy={verticalListSortingStrategy}>`
2. Replace `useDraggable` with `useSortable` in DraggableItem
3. Update `handleDragEnd` to read `over.id` for position, not just container
4. Calculate insertion index from collision detection

### Files to Modify

| File | Change |
|------|--------|
| `TierListView.tsx` | Add SortableContext, update handleDragEnd logic |
| `DraggableItem.tsx` | Switch from useDraggable to useSortable |
| `TierRow.tsx` | Wrap children in SortableContext |
| `UnrankedPool.tsx` | Wrap children in SortableContext |

### Collision Detection Strategy

For horizontal layouts in tiers, use `closestCenter` or `rectIntersection`:

```typescript
import { closestCenter } from '@dnd-kit/core';

<DndContext
  collisionDetection={closestCenter}
  // ...
>
```

## Competitive Analysis

| App | Position Control | Drop Indicator | Touch Delay |
|-----|-----------------|----------------|-------------|
| Trello | Yes (SortableContext) | Line indicator | ~150ms |
| Notion | Yes | Gap highlight | ~100ms |
| TierMaker.com | No (append only) | None | N/A (mouse only) |
| **Tierguy (current)** | No | None | 200ms |

Tierguy matches TierMaker.com but falls short of Trello/Notion polish.

## Effort Estimate

- **SortableContext + position tracking**: Medium (1-2 days)
- **Drop indicator visual**: Small (half day)
- **Touch delay tuning**: Trivial (test and adjust)
- **Undo button**: Small (store already supports it)

Total for must-haves: ~2-3 days.
