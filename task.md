Нам нужно написать File Generator

## Базовые требования
  - никакого бэкенда - только FE
  - для компонентов используем daisyui

## Требования к функционалу

### По типам файлов
  - IMAGE
    - Format: png, jpeg, svg, bmp, gif
    - width, height
    - size in MB, KB (disabled for svg)
  - txt
    - size in MB/KB (optional)
      - disabled if size os specified
    - rows amount (min is 1)
  - csv
    - columns amount (min is 1)
    - rows amount (min is 1)
      - disabled is size is specified
    - size in MB/KB (optional)
  - pdf
    - pageFormat: A4, letter, A3
    - pages (min is 1)
      - disabled is size is specified
    - size in MB/KB (optional)
  - bin
    - size in MB, KB
  - zip
    - size in MB (min 500KB)
    - Hidden files: true/false
    - Long filenames: true/false
    - Depth: can be 1-3

### QUESTIONS: 

  - how to create a zip from FE?? any lib?
  - how to create an image from FE?? any lib?
  - how to create a pdf from FE with specific size? (can we use print functionality?)

