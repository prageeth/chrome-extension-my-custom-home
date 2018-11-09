(function($, window) {

	var PAGE_CONTENT_STORAGE_KEY = 'page-content';

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

		var converter = new showdown.Converter();
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

	});

})(jQuery, window);