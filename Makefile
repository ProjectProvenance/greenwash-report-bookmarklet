copy_bookmarklet_to_clipboard: check-uglify
	uglifyjs main.js -c -m | \
	node -e "process.stdin.on('data', data => { console.log('javascript:' + encodeURIComponent(data.toString())) })" | \
	pbcopy \
	echo "Bookmarklet copied to clipboard!"

check-uglify:
	@which uglifyjs > /dev/null || npm install -g uglify-js