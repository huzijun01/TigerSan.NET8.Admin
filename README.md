# Description:

A Vue 3 UI library.

Supports theme switching and language switching.

![preview](https://github.com/huzijun01/TigerSan.Web.UI/blob/main/preview.webp?raw=true)

# About:

## Personal Homepage:

bilibili: https://space.bilibili.com/34323512

## GitHub:

https://github.com/huzijun01/TigerSan.Web.UI

## NPM:

https://www.npmjs.com/package/tigersan-ui

# How To Use:

1\. Import CSS in the `main.ts`:

```typescript
import 'tigersan-ui/dist/tigersan-ui.css'
```

2\. Create `theme.css` in the `public` folder:

```css
/* 【主题】 */
:root {
  /* [主色] */
  --theme-brand: var(--color-brand);
  /* [前景] */
  --theme-color: rgba(0, 0, 0, 0.85);
  --theme-color-disabled: var(--color-disabled-text);
  --theme-color-placeholder: var(--color-placeholder-text);
  --theme-button-color-disabled: var(--color-foreground-disabled);
  /* [背景] */
  --theme-card-background: white;
  --theme-panel-background: #f0f2f5;
  --theme-input-background: white;
  --theme-input-background-disabled: var(--color-black-10);
  /* [边框] */
  --theme-border: #d9d9d9;
  --theme-border-hover: var(--theme-brand);
  --theme-border-active: var(--theme-brand);
  --theme-border-disabled: var(--color-dark-border);
  --theme-border-divider: #E5E5E5;
  /* [遮罩] */
  --theme-mask-hover: var(--color-black-10);
  --theme-mask-active: var(--color-black-50);
  /* [链接] */
  --theme-link-color: #34a1ff;
  /* [按钮] */
  --theme-button-color: var(--color-primary-text);
  /* [导航] */
  --theme-nav-color: var(--theme-color);
  --theme-nav-color-hover: var(--theme-brand);
  --theme-nav-color-selected: var(--theme-brand);
  --theme-nav-background: var(--color-brand-25);
  --theme-nav-item-background-hover: var(--color-black-25);
  --theme-nav-item-background-selected: var(--color-brand-25);
  --theme-nav-line-background: var(--color-black-25);
  --theme-nav-logo-border-padding: 5px;
  --theme-nav-logo-border-background: white;
  --theme-nav-logo-border-radius: 0 30px 30px 0;
  /* [表格] */
  --theme-table-line-background: var(--color-black-25);
  --theme-table-header-background: #fafafc;
  --theme-table-row-background-selected: var(--color-brand-10);
  /* [树] */
  --theme-tree-node-background-active: var(--color-brand-25);
  /* [弹窗] */
  --theme-dialog-title-color: var(--color-primary-text);
}
```

# Components:

## Button:

### IconButton

## Charts:

### EChart

### Pie

## Content:

### Lottie

## Dashboard:

### CountCard

## Dialog:

### Dialog

### Drawer

### ImagePreview

### Loading

### Pop

### PopWindow

### Toast

### Toasts

## Drawer:

### DrawerBox

## Form:

### Form

### FormItem

### FormRow

### PopForm

## Inputs:

### Upload

### Checkbox

### CheckboxGroup

### DatePicker

### Password

### Search

### Select

### SelectMenu

### Switch

### TextBox

## Map:

### ClusterMarker

### Map

### Marker

## NavBar:

### NavBar

### NavButton

### NavFolder

## Other:

### Beian

## PageView:

### DefaultPage

### PageButton

### PageCard

### PageContent

### PageView

### RouterPage

### TabView

## Pagination:

### KeyValue

### Pagination

### PaginationButton

## Table:

### RowData

### Table

### TableHeader

### TableItem

## Tree:

### Arrow

### Tree

### TreeNode

# Helpers:

## AxiosHelper:

### AxiosBase

### AxiosHelper

## Behaviors:

### CheckboxBehavior

### ClickOutsideBehavior

### ContentBehavior

### ContentSizeBehavior

### FolderBehavior

### LanguageBehavior

### SizeBehavior

### WatchBehavior

## Other:

### ArrayHelper

### BigintHelper

### ClassObserver

### ComponentHelper

### ConfigBase

### ConfigHelper

### DomHelper

### MathHelper

### ObjectHelper

### ParamHelper

### PathHelper

### RectHelper

### StringHelper

### ThemeHelper

### TimerHelper

### TokenHelper

### Verify

# Base:

## types:

### Int

## colors:

### Theme

### Colors

## icon:

### Icons

# Texts