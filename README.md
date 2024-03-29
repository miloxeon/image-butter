<p align="center">
    <img src="https://user-images.githubusercontent.com/14220138/119407585-f3d6e400-bcd3-11eb-90fa-01f3caac9bb8.gif" width="300" alt="" /> <img src="https://user-images.githubusercontent.com/14220138/119407635-06511d80-bcd4-11eb-8ffc-402bc01cdca2.gif" width="300" alt="" />
</p>
<p align="center">
    <a href="https://github.com/miloxeon/image-butter/blob/master/package.json"><img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Dependencies"></a>
    <a href="https://www.npmjs.com/package/image-butter"><img alt="npm" src="https://img.shields.io/npm/v/image-butter"></a>
    <img alt="License" src="https://img.shields.io/github/license/miloxeon/image-butter?color=brightgreen">
</p>
<p align="center">
    <a href="https://miloslav.website/image-butter">Demo</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="#usage">Usage</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://miloslav.website">Author</a>
</p>

# 🧈 Image Butter
Smooth, animated image load with zero config.

## Why?

Default webpage loading process is kinda ugly. Heavy elements like images appear too harshly when they load. To make this experience smoother, 🧈 Butter exists.

## What it does?

It coordinates the document loading process and shows images as soon as they fully load with a nice, smooth animation.

## Advantages

- 🤓 Good for page performance – it uses just one listener to monitor the webpage loading process and uses one listener per image. Listeners are destroyed when not needed.
- 🥸 Vanishes without a trace when everything is loaded, restoring DOM to what it used to be before Butter stepped in.
- 💍 Uses no wrappers around images, uses no inline styles on images.
- 🥳 Good for a11y, doesn't interfere with `alt`.
- 🛠 Framework-agnostic — works with everything from Knockout.js to Web Components. Relies fully on browser API.
- 👌 Zero-dependency and zero-configuration.

## Caveats

There is a [bug in Safari](https://github.com/angular/angular/issues/37440) which will make every transition linear. That's a bummer from the design point of view, but everything still works.

## Usage

It's recommended that you use Butter as an external script because it's better to put it into `<head>`, not into `<body>` as usual. Butter needs to step in *before* page fully loads. So just put it into `head`:

```HTML
<head>
    ...
    <script src="https://cdn.jsdelivr.net/gh/mvoloskov/image-butter/dist/image-butter.min.js"></script>
    <script>
        imageButter()
    </script>
</head>
```

**Every image should have `width` and `height`**. We can't predict image size before it loads, but you can predefine it. **Butter will ignore images without inline width and height**. It also ignores decorative images (e.g. images with empty `alt`).

```HTML
<!-- Bad, will be ignored -->
<img src="https://example.com/800/480" alt="" />


<!-- Decorative, will be ignored -->
<img src="https://example.com/800/480" width="800" height="480" alt="" />


<!-- Good, will animate -->
<img src="https://example.com/800/480" width="800" height="480" alt="Cute cat" />
```

As soon as you included the script, called `butter()` and made sure your images have `width` and `height`, this will work immediately. No further configuration is needed.

## Alternative usage (as a module)

If you know what you're doing, you can always use it as a dependency:

```
npm install image-butter
```

```JS
import butter from 'image-butter'

// the earlier you call it the better
butter()
```

If called after everything is loaded, Butter just does nothing. There is no need to pretend that images are being loaded when they're already been fully loaded and just sit there ready to be displayed.

Enjoy!
