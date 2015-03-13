# Honey I Shrunk The Finding Aids
Turn EAD into cute little PNG and SVG images, see examples below.

You need to have node.js installed.

Download/Clone the repo
```
cd honey-i-shrunk-the-finding-aids/
npm install
```

Goto https://github.com/Automattic/node-canvas#installation to find out how to install support libraries for the canvas library (Cairo)  

Syntax:
```
  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -f, --file [filename]  The EAD filename or directory (many eads) to process
    -m, --mode [png|svg]   The file output type
    -w, --width [number]   How wide to make your mini finding aid, default 200
    -s, --shrink [float]   What percentage to shrink by, default: 0.85

```

Example command line:
```
node convert.js -f "data/ead/2197.xml"

Reduce .5 make the image 150px wide
node convert.js -f "data/ead/2197.xml" -s 0.5 -w 150

Reduce .2 make the image 100px wide
node convert.js -f "data/ead/2197.xml" -s 0.2 -w 100
```

Examples: ![Small](https://dl.dropboxusercontent.com/u/16562899/big.png "Small") or ![Smaller](https://dl.dropboxusercontent.com/u/16562899/small.png "Smaller")







