# CSS Grid vs Flexbox: Complete Guide

## Quick Summary First

**Flexbox** = **1-dimensional** layout (either row OR column)\
**Grid** = **2-dimensional** layout (rows AND columns at the same time)

Think of it like: - **Flexbox**: Arranging books on a shelf (one direction) - **Grid**: Arranging items in a spreadsheet (rows and columns)

------------------------------------------------------------------------

## FLEXBOX: The 1D Layout Master

### **Best for:**

-   Navigation bars
-   Button groups\
-   Centering items
-   Space distribution along ONE axis

### **Basic Flexbox Example:**

``` css
.flex-container {
  display: flex;
  justify-content: space-between; /* horizontal spacing */
  align-items: center;            /* vertical alignment */
}
```

``` html
<div class="flex-container">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**Result**: `[Item 1]    [Item 2]    [Item 3]` (horizontal line)

### **Flexbox Key Properties:**

``` css
.flex-container {
  display: flex;
  flex-direction: row;        /* row, column, row-reverse, column-reverse */
  justify-content: center;    /* main axis alignment */
  align-items: center;        /* cross axis alignment */
  flex-wrap: wrap;           /* wrap items to new line */
  gap: 10px;                 /* space between items */
}

.flex-item {
  flex: 1;                   /* grow to fill space */
  flex-shrink: 0;            /* don't shrink */
  flex-basis: 200px;         /* initial size */
}
```

------------------------------------------------------------------------

## CSS GRID: The 2D Layout Master

### **Best for:**

-   Page layouts
-   Card grids
-   Complex layouts with both rows and columns
-   Overlapping elements

### **Basic Grid Example (Your Subcategory Case):**

``` css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 3 equal columns */
  gap: 10px;
}
```

``` html
<div class="grid-container">
  <div>Safety</div>
  <div>Accessibility</div>
  <div>Walkability</div>
</div>
```

**Result**:

```         
[Safety]        [Accessibility]     [Walkability]
```

### **Grid Template Columns Explained:**

``` css
/* Different ways to define columns */
grid-template-columns: 1fr 1fr 1fr;           /* 3 equal flexible columns */
grid-template-columns: 200px 200px 200px;     /* 3 fixed 200px columns */
grid-template-columns: 1fr 2fr 1fr;           /* middle column is 2x wider */
grid-template-columns: auto auto auto;        /* columns fit content */
grid-template-columns: repeat(3, 1fr);        /* shorthand for 1fr 1fr 1fr */
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* responsive! */
```

### **Grid Template Rows:**

``` css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 200px;      /* first row 100px, second 200px */
}
```

------------------------------------------------------------------------

## GRID POSITIONING: span, start, end

### **The Grid System:**

Think of grid like a table with invisible lines:

```         
    1     2     3     4  ← column lines
1   +-----+-----+-----+
    |  A  |  B  |  C  |
2   +-----+-----+-----+
    |  D  |  E  |  F  |
3   +-----+-----+-----+
    ↑ row lines
```

### **Grid Item Positioning:**

#### **Method 1: grid-column and grid-row**

``` css
.item-a {
  grid-column: 1 / 3;    /* start at column line 1, end at line 3 */
  grid-row: 1 / 2;       /* start at row line 1, end at line 2 */
}
/* Result: Item A spans 2 columns in first row */
```

#### **Method 2: Using span**

``` css
.item-b {
  grid-column: span 2;   /* span across 2 columns */
  grid-row: span 1;      /* span across 1 row */
}
/* Result: Item B takes up 2 column spaces */
```

#### **Method 3: grid-area (shorthand)**

``` css
.item-c {
  grid-area: 1 / 2 / 3 / 4;  /* row-start / col-start / row-end / col-end */
}
/* Result: starts at row 1 col 2, ends at row 3 col 4 */
```

### **Practical Grid Examples:**

#### **Example 1: Website Layout**

``` css
.page-layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

#### **Example 2: Card Grid with Featured Item**

``` css
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.featured-card {
  grid-column: span 2;  /* takes 2 column spaces */
  grid-row: span 2;     /* takes 2 row spaces */
}
```

------------------------------------------------------------------------

## WHEN TO USE WHICH?

### **Use Flexbox when:**

✅ Aligning items in one direction\
✅ Distributing space between items\
✅ Centering content\
✅ Navigation menus\
✅ Button groups\
✅ Simple component layouts

**Examples:**

``` css
/* Navbar */
.navbar { 
  display: flex; 
  justify-content: space-between; 
}

/* Center a modal */
.modal-overlay { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}

/* Button group */
.button-group { 
  display: flex; 
  gap: 10px; 
}
```

### **Use Grid when:**

✅ 2D layouts (rows AND columns)\
✅ Complex page layouts\
✅ Card/tile layouts\
✅ Overlapping elements\
✅ Precise positioning needed

**Examples:**

``` css
/* Photo gallery */
.gallery { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
  gap: 15px; 
}

/* Dashboard layout */
.dashboard { 
  display: grid; 
  grid-template-columns: 250px 1fr; 
  grid-template-rows: 60px 1fr; 
}

/* Your subcategory checkboxes */
.subcategory { 
  display: grid; 
  grid-template-columns: 1fr 1fr 1fr; 
}
```

------------------------------------------------------------------------

## YOUR SUBCATEGORY EXAMPLE BREAKDOWN

### **What your CSS does:**

``` css
.checkbox-group.subcategory {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 3 equal columns */
  gap: 10px;
}
```

### **Step-by-step:**

1.  `display: grid` → "I want a 2D grid layout"
2.  `grid-template-columns: 1fr 1fr 1fr` → "Make 3 columns, all equal width"
3.  `gap: 10px` → "Put 10px space between all grid items"

### **What `1fr` means:**

-   `fr` = "fraction of available space"
-   `1fr 1fr 1fr` = "each column gets 1/3 of available space"
-   `1fr 2fr 1fr` = "middle column gets 2/4, others get 1/4 each"

### **Alternative ways to write the same thing:**

``` css
grid-template-columns: 1fr 1fr 1fr;        /* explicit */
grid-template-columns: repeat(3, 1fr);     /* shorthand */
grid-template-columns: 33.33% 33.33% 33.33%; /* percentage */
```

------------------------------------------------------------------------

## RESPONSIVE GRID (BONUS!)

### **Auto-responsive grid:**

``` css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}
```

**What this does:** - `repeat()` → repeat the pattern - `auto-fit` → fit as many columns as possible - `minmax(200px, 1fr)` → each column minimum 200px, maximum equal share - **Result**: Automatically adjusts number of columns based on screen size!

------------------------------------------------------------------------

## FLEXBOX vs GRID: Visual Comparison

### **Same 3 items, different layouts:**

#### **Flexbox (1D):**

``` css
.flex { display: flex; gap: 10px; }
```

**Result**: `[Item 1] [Item 2] [Item 3]` (one line)

#### **Grid (2D):**

``` css
.grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 10px; 
}
```

**Result**:

```         
[Item 1] [Item 2]
[Item 3]
```

------------------------------------------------------------------------

## COMMON PATTERNS YOU'LL USE

### **Pattern 1: Equal columns (your case)**

``` css
.three-columns { 
  display: grid; 
  grid-template-columns: 1fr 1fr 1fr; 
}
```

### **Pattern 2: Sidebar + main content**

``` css
.sidebar-layout { 
  display: grid; 
  grid-template-columns: 250px 1fr; 
}
```

### **Pattern 3: Responsive card grid**

``` css
.card-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 20px; 
}
```

### **Pattern 4: Center with flex**

``` css
.center-flex { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}
```

### **Pattern 5: Space between with flex**

``` css
.navbar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
```

------------------------------------------------------------------------

## QUICK REFERENCE

### **Grid Properties:**

``` css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  grid-template-areas: "header header header";
}

.grid-item {
  grid-column: 1 / 3;      /* span from column 1 to 3 */
  grid-row: span 2;        /* span 2 rows */
  grid-area: header;       /* use named area */
}
```

### **Flexbox Properties:**

``` css
.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.flex-item {
  flex: 1;                 /* grow to fill */
  flex-basis: 200px;       /* starting size */
  flex-shrink: 0;          /* don't shrink */
}
```

------------------------------------------------------------------------

## TL;DR Summary

**Flexbox** = Arrange items in a line (horizontal or vertical)\
**Grid** = Arrange items in a table-like structure\

**Your subcategory checkboxes**: Perfect use case for Grid because you want exactly 3 columns side by side!

**Next time you need layout**, ask yourself: - "Do I need just a row or column?" → **Flexbox** - "Do I need both rows AND columns?" → **Grid**

Happy coding! 🎉