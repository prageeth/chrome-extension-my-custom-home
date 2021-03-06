(function($, window) {

	var PAGE_CONTENT_STORAGE_KEY = 'page-content';
	var RATE_COUNTUP_STORAGE_KEY = 'rate-count-up';

	var RATE_COUNT_MAX = 20;

	var Storage = {

		get: function(name, callback) {
			chrome.storage.local.get(name, function(result) {
				callback && callback(result[name], name);
			});
		},

		set: function(name, value) {
			chrome.storage.local.set({
				[name]: value
			});
		}

	};

	$(document).ready(function() {

		var $preloader = $('.preloader');
		var $mainToolbar = $('#main-action-button');
		var $mainContent = $('#main-content');
		var $mainEditor = $('#main-editor');

		var converter = new showdown.Converter({
			tables: true,
			strikethrough: true,
			simplifiedAutoLink: true,
			openLinksInNewWindow: true,
			emoji: true
		});

		var simplemde = null;
		var content = '';

		function initEditor() {

			// refresh
			removeEditor();

			simplemde = new SimpleMDE({
				element: $mainEditor[0],
				initialValue: content,
				hideIcons: [ 'fullscreen' ]
			});

			simplemde.toggleFullScreen();

			simplemde.codemirror.on('change', function() {
				content = simplemde.value();
				Storage.set(PAGE_CONTENT_STORAGE_KEY, content);
			});

		}

		function removeEditor() {
			if (simplemde) {
				simplemde.toTextArea();
				simplemde = null;
			}
		}

		function initActionButton() {

			var $editButton = $mainToolbar.find('.edit-button');

			$editButton.on('click', function() {

				$editButton.toggleClass('editing');

				if ($editButton.is('.editing')) {
					initEditor();
					$mainEditor.removeClass('hidden');
					$mainContent.addClass('hidden');
				} else {
					removeEditor();
					initPage();
					$mainEditor.addClass('hidden');
					$mainContent.removeClass('hidden');
				}

			});

			$mainToolbar.removeClass('hidden');

		}

		function initPage() {
			if (!content) {
				$mainContent.addClass('content-not-set');
			} else {
				$mainContent.removeClass('content-not-set');
			}
			$mainContent.html(converter.makeHtml(content));
		}

		// init
		Storage.get(PAGE_CONTENT_STORAGE_KEY, function(initialValue) {
			
			content = initialValue;

			initActionButton();
			initPage();

			$mainContent.removeClass('hidden');
			$preloader.addClass('hidden');

		});

		// rating
		Storage.get(RATE_COUNTUP_STORAGE_KEY, function(count) {

			// already rated?
			if (count < 0) {
				return;
			}

			count = count || 0;
			if (count < RATE_COUNT_MAX) {
				Storage.set(RATE_COUNTUP_STORAGE_KEY, count + 1);
				return;
			}
			
			var $ratingContainer = $('#rating');

			$ratingContainer.find('.rating-link').on('click', function() {
				Storage.set(RATE_COUNTUP_STORAGE_KEY, -1);
			});
			$ratingContainer.show();

		});

	});

})(jQuery, window);