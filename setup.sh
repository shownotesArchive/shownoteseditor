
mkdir js/lib
cd js/lib
wget "https://raw.github.com/caolan/async/master/lib/async.js" -O async.js
wget "https://raw.github.com/jamuhl/i18next/master/release/i18next-1.6.3.min.js" -O i18next-1.6.3.min.js
wget "https://raw.github.com/jeromeetienne/microevent.js/master/microevent.js" -O microevent.js
wget "https://raw.github.com/moment/moment/2.1.0/min/moment.min.js" -O moment.min.js

mkdir audiojs
cd audiojs
wget "https://raw.github.com/luto/audiojs/master/audiojs/audio.min.js" -O audio.min.js
wget "https://raw.github.com/luto/audiojs/master/audiojs/audiojs.swf" -O audiojs.swf
wget "https://raw.github.com/luto/audiojs/master/audiojs/player-graphics.gif" -O player-graphics.gif
cd ..

mkdir mediaelement
wget "http://github.com/johndyer/mediaelement/zipball/master" -O elementjs.zip
mediaelementfiles=$(unzip -l elementjs.zip | grep -oP "johndyer-mediaelement-[a-z0-9]+/build/.+" | grep -v txt)
unzip -oqj elementjs.zip $mediaelementfiles -d mediaelement

cd ../..

mkdir demo/lib
cd demo/lib
wget "https://raw.github.com/visionmedia/move.js/master/move.min.js" -O move.min.js
wget "http://gregweber.info/projects/demo/flavorzoom_files/jquery.uitablefilter.js" -O jquery.uitablefilter.js
cd ..

cd demo
wget "http://der-lautsprecher.de/?download_media_file=1" -O ls000-der-lautsprecher.mp3
cd ..

mkdir test/lib
cd test/lib
wget "https://raw.github.com/AStepaniuk/qunit-parameterize/master/qunit-parameterize.js" -O qunit-parameterize.js
cd ../..

mkdir css/lib
cd css/lib
wget "http://necolas.github.io/normalize.css/2.1.3/normalize.css" -O normalize.css
cd ../..
